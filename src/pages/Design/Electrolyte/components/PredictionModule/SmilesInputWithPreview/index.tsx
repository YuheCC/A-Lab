import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { moleculeService, type MoleculeDetails } from '@/services/chat/moleculeService';
import { useAuthStore } from '@/models/useAuth';
import { isColumnVisibleForUser } from '@/constants/columnAccess';
import MolViewer2D from '@/components/NodePopup/MolViewer2D.js';

export interface SmilesInputHandle {
  /** 触发验证，返回是否合法；SMILES 为空时跳过并返回 valid */
  validate: () => Promise<{ isValid: boolean }>;
  /** 同步获取当前验证状态；未验证时返回 null */
  getValidationState: () => { isValid: boolean; hasBeenValidated: boolean };
}

interface SmilesInputWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
  label: ReactNode;
  placeholder?: string;
  /** 输入内容变化时通知父级重置预测结果 */
  onResultsInvalidate?: () => void;
}

const SmilesInputWithPreview = forwardRef<SmilesInputHandle, SmilesInputWithPreviewProps>(
  ({ value, onChange, label, placeholder, onResultsInvalidate }, ref) => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore((state) => state.userPermissions);

    const [moleculeDetails, setMoleculeDetails] = useState<MoleculeDetails | null>(null);
    const [isMoleculeLoading, setIsMoleculeLoading] = useState(false);
    const [lastQueriedSmiles, setLastQueriedSmiles] = useState<string | null>(null);
    const [isInvalidSmiles, setIsInvalidSmiles] = useState(false);

    const canShowColumn = (columnId?: string | null) =>
      isColumnVisibleForUser(columnId, userPermissions);

    const validateSmiles = async (
      smilesInput: string,
    ): Promise<{ isValid: boolean }> => {
      if (smilesInput === lastQueriedSmiles) {
        return { isValid: !isInvalidSmiles };
      }

      setIsMoleculeLoading(true);
      setMoleculeDetails(null);
      setIsInvalidSmiles(false);

      try {
        const details = await moleculeService.getMoleculeDetails(
          smilesInput,
          userPermissions || undefined,
        );

        if (
          details?.properties.smiles &&
          details.properties.smiles === 'F[P-](F)(F)(F)(F)F.[Li+]'
        ) {
          setMoleculeDetails(null);
        } else {
          setMoleculeDetails(details);
        }

        setLastQueriedSmiles(smilesInput);
        return { isValid: true };
      } catch (error) {
        console.error('获取分子详情失败:', error);

        if (error instanceof Error && error.message === 'Invalid SMILES string') {
          setIsInvalidSmiles(true);
          setLastQueriedSmiles(smilesInput);
          return { isValid: false };
        }

        setLastQueriedSmiles(smilesInput);
        return { isValid: true };
      } finally {
        setIsMoleculeLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const trimmed = value.trim();
        if (!trimmed) return { isValid: true };
        return validateSmiles(trimmed);
      },
      getValidationState: () => {
        const trimmed = value.trim();
        if (!trimmed) return { isValid: true, hasBeenValidated: true };
        const hasBeenValidated = lastQueriedSmiles === trimmed;
        return { isValid: !isInvalidSmiles, hasBeenValidated };
      },
    }));

    const handleBlur = () => {
      const trimmed = value.trim();
      if (!trimmed) {
        setMoleculeDetails(null);
        setIsInvalidSmiles(false);
        setLastQueriedSmiles(null);
      } else {
        validateSmiles(trimmed);
      }
    };

    const handleChange = (newValue: string) => {
      onChange(newValue);
      const trimmed = newValue.trim();

      if (!trimmed || (lastQueriedSmiles && trimmed !== lastQueriedSmiles)) {
        setMoleculeDetails(null);
        setIsInvalidSmiles(false);
        if (!trimmed) setLastQueriedSmiles(null);
      }

      if (onResultsInvalidate && lastQueriedSmiles && trimmed !== lastQueriedSmiles) {
        onResultsInvalidate();
      }
    };

    const allProperties = moleculeDetails
      ? [
          {
            label: t('performance.moleculeInfo.properties.smiles'),
            value: moleculeDetails.properties.smiles || '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.espMin'),
            value:
              typeof moleculeDetails.properties.espMin === 'number'
                ? moleculeDetails.properties.espMin.toFixed(2) + ' eV'
                : moleculeDetails.properties.espMin || '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.molecularWeight'),
            value:
              typeof moleculeDetails.properties.molecularWeight === 'number'
                ? moleculeDetails.properties.molecularWeight.toFixed(2)
                : moleculeDetails.properties.molecularWeight || '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.predictedMp'),
            value: moleculeDetails.properties.meltingPoint || '-',
            show: canShowColumn('predicted_mp_celsius'),
          },
          {
            label: t('performance.moleculeInfo.properties.umapX'),
            value:
              moleculeDetails.properties.umapX !== undefined
                ? moleculeDetails.properties.umapX.toFixed(4)
                : '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.predictedBp'),
            value: moleculeDetails.properties.boilingPoint || '-',
            show: canShowColumn('predicted_bp_celsius'),
          },
          {
            label: t('performance.moleculeInfo.properties.umapY'),
            value:
              moleculeDetails.properties.umapY !== undefined
                ? moleculeDetails.properties.umapY.toFixed(4)
                : '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.predictedFp'),
            value: moleculeDetails.properties.flashPoint || '-',
            show: canShowColumn('predicted_fp_celsius'),
          },
          {
            label: t('performance.moleculeInfo.properties.homo'),
            value:
              typeof moleculeDetails.properties.homo === 'number'
                ? moleculeDetails.properties.homo.toFixed(4) + ' eV'
                : moleculeDetails.properties.homo || '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.combustionEnthalpy'),
            value: moleculeDetails.properties.combustionEnthalpy || '-',
            show: canShowColumn('combustion_enthalpy_ev'),
          },
          {
            label: t('performance.moleculeInfo.properties.lumo'),
            value:
              typeof moleculeDetails.properties.lumo === 'number'
                ? moleculeDetails.properties.lumo.toFixed(4) + ' eV'
                : moleculeDetails.properties.lumo || '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.commercialViability'),
            value: moleculeDetails.properties.commercialViability || '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.espMax'),
            value:
              typeof moleculeDetails.properties.espMax === 'number'
                ? moleculeDetails.properties.espMax.toFixed(3) + ' eV'
                : moleculeDetails.properties.espMax || '-',
            show: true,
          },
          {
            label: t('performance.moleculeInfo.properties.functionalGroups'),
            value: moleculeDetails.properties.functionalGroups
              ? (() => {
                  try {
                    const g = JSON.parse(moleculeDetails.properties.functionalGroups);
                    return Array.isArray(g) ? g.join(', ') : moleculeDetails.properties.functionalGroups;
                  } catch {
                    return moleculeDetails.properties.functionalGroups;
                  }
                })()
              : '-',
            show: true,
          },
        ]
      : [];

    const visibleProperties = allProperties.filter((p) => p.show);

    return (
      <div className="pm-smiles-input-with-preview">
        <label className="pm-additive-label">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pm-additive-input"
        />

        {isMoleculeLoading && (
          <div className="pm-molecule-loading">
            <p>{t('performance.moleculeInfo.loading')}</p>
          </div>
        )}

        {moleculeDetails && (
          <div className="pm-molecule-information">
            <div className="pm-molecule-header">
              <h3>{t('performance.moleculeInfo.title')}</h3>
              <button
                className="pm-molecule-close-btn"
                onClick={() => setMoleculeDetails(null)}
              >
                ×
              </button>
            </div>
            <div className="pm-molecule-content">
              <div className="pm-molecule-structure">
                {moleculeDetails.properties.smiles ? (
                  <MolViewer2D
                    smile={moleculeDetails.properties.smiles}
                    cation={moleculeDetails.properties.cation}
                    theme="light"
                    className=""
                    style={{}}
                  />
                ) : (
                  <div className="pm-structure-placeholder">
                    <div className="pm-structure-circle">
                      <span>{t('performance.moleculeInfo.structurePlaceholder.line1')}</span>
                      <span>{t('performance.moleculeInfo.structurePlaceholder.line2')}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="pm-molecule-properties">
                <div className="pm-properties-grid">
                  {visibleProperties.map((prop, i) => (
                    <div className="pm-property-item" key={i}>
                      <label>{prop.label}</label>
                      <span>{prop.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isInvalidSmiles && (
          <div className="pm-smiles-error-display">
            <div className="pm-error-header">
              <h3>{t('performance.invalidSmiles.title')}</h3>
            </div>
            <div className="pm-smiles-error-content">
              <p>{t('performance.invalidSmiles.description')}</p>
              <p>{t('performance.invalidSmiles.suggestion')}</p>
              <div className="pm-example-molecules">
                <div className="pm-molecule-examples">
                  <span className="pm-example-molecule">[Li+].[O-]P(=O)(F)F</span>
                  <span className="pm-example-molecule">O=C1OC(F)CO1</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

SmilesInputWithPreview.displayName = 'SmilesInputWithPreview';

export default SmilesInputWithPreview;
