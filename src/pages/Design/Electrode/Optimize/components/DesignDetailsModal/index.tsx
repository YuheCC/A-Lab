import React from 'react';
import { Modal, Input, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { DesignDetails } from '../../types';
import './index.less';

interface DesignDetailsModalProps {
  visible: boolean;
  data: DesignDetails | null;
  loading: boolean;
  onClose: () => void;
}

interface ReadOnlyInputProps {
  label: string;
  value?: string;
}

const ReadOnlyInput: React.FC<ReadOnlyInputProps> = ({ label, value }) => (
  <div className="readonly-input-wrapper">
    <label>{label}</label>
    <Input value={value || '-'} readOnly />
  </div>
);

const DesignDetailsModal: React.FC<DesignDetailsModalProps> = ({
  visible,
  data,
  loading,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={
        data
          ? `${t('design.electrode.optimize.designDetails')} - Rank #${data.rank}`
          : t('design.electrode.optimize.designDetails')
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      className="design-details-modal"
    >
      {loading ? (
        <div className="design-details-loading">
          <Spin size="large" />
        </div>
      ) : data ? (
        <div className="design-details-content">
          <div className="design-details-grid">
            {/* 左列 */}
            <div className="design-details-column">
              <ReadOnlyInput
                label={t('design.electrode.optimize.cellDesign')}
                value={data.cellDesign}
              />
              <ReadOnlyInput
                label={t('design.electrode.optimize.cathodeActiveMaterial')}
                value={data.cathodeActiveMaterial}
              />

              <h3 className="design-details-subtitle">
                {t('design.electrode.optimize.cathodeParameters')}
              </h3>
              <div className="design-details-parameters">
                <ReadOnlyInput label="KF-0700 (wt.%)" value={data.cathodeParameters.binder1} />
                <ReadOnlyInput label="CN-01Y (wt.%)" value={data.cathodeParameters.binder2} />
                <ReadOnlyInput
                  label="Super C65 (wt.%)"
                  value={data.cathodeParameters.conductiveCarbon}
                />
                <ReadOnlyInput
                  label="Active material: NCM-A (%)"
                  value={data.cathodeParameters.activeMaterial}
                />
                <ReadOnlyInput
                  label="Areal Loading (mAh/cm²)"
                  value={data.cathodeParameters.arealLoading}
                />
                <ReadOnlyInput
                  label="Press Density (g/cc)"
                  value={data.cathodeParameters.pressDensity}
                />
              </div>
            </div>

            {/* 右列 */}
            <div className="design-details-column">
              <ReadOnlyInput
                label={t('design.electrode.optimize.npRatio')}
                value={data.npRatio}
              />
              <ReadOnlyInput
                label={t('design.electrode.optimize.anodeActiveMaterial')}
                value={data.anodeActiveMaterial}
              />

              <h3 className="design-details-subtitle">
                {t('design.electrode.optimize.anodeParameters')}
              </h3>
              <div className="design-details-parameters">
                <ReadOnlyInput label="CMC (wt.%)" value={data.anodeParameters.binder1} />
                <ReadOnlyInput label="SBR (wt.%)" value={data.anodeParameters.binder2} />
                <ReadOnlyInput label="PAA (wt.%)" value={data.anodeParameters.binder3} />
                <ReadOnlyInput
                  label="Super P (wt.%)"
                  value={data.anodeParameters.conductiveCarbon1}
                />
                <ReadOnlyInput
                  label="5WCNT (wt.%)"
                  value={data.anodeParameters.conductiveCarbon2}
                />
                <ReadOnlyInput
                  label="Active material-1: SC-B-i (%)"
                  value={data.anodeParameters.activeMaterial1}
                />
                <ReadOnlyInput
                  label="Active material-2: Gr-S-i (%)"
                  value={data.anodeParameters.activeMaterial2}
                />
                <ReadOnlyInput
                  label="Areal Loading (mAh/cm²)"
                  value={data.anodeParameters.arealLoading}
                />
                <ReadOnlyInput
                  label="Press Density (g/cc)"
                  value={data.anodeParameters.pressDensity}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default DesignDetailsModal;
