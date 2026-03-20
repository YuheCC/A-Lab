import React from 'react';
import { Modal, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { BackwardResultItemDTO } from '@/services/electrode/types';
import RateCapabilityChart, {
  hasRateCapabilityData,
} from '../../../Predict/components/RateCapabilityChart';
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
} from '../../../constants';
import './index.less';

interface DesignDetailsModalProps {
  visible: boolean;
  data: BackwardResultItemDTO | null;
  rank: number;
  cellDesign: string;
  npRatio: string;
  cathodeActiveMaterial: string;
  anodeMaterialLabel: string;
  /** Cathode Width (mm)，来自表单，接口结果中不含此字段 */
  width: string;
  /** Cathode Length (mm)，来自表单，接口结果中不含此字段 */
  length: string;
  loading: boolean;
  onClose: () => void;
}

interface ParameterItemProps {
  label: string;
  value?: string | number;
}

const ParameterItem: React.FC<ParameterItemProps> = ({ label, value }) => (
  <div className="designdetail-parameter-item">
    <span className="designdetail-parameter-label">{label}</span>
    <span className="designdetail-parameter-value">
      {value !== undefined && value !== null
        ? typeof value === 'number'
          ? value.toFixed(2)
          : value
        : '-'}
    </span>
  </div>
);

interface PerformanceCardProps {
  label: string;
  value: number | string;
  unit: string;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ label, value, unit }) => (
  <div className="designdetail-performance-card">
    <div className="designdetail-performance-label">{label}</div>
    <div className="designdetail-performance-value">
      {typeof value === 'number' ? value.toFixed(2) : value}{' '}
      <span className="designdetail-performance-unit">{unit}</span>
    </div>
  </div>
);

interface DesignInfoItemProps {
  label: string;
  value: string | number;
}

const DesignInfoItem: React.FC<DesignInfoItemProps> = ({ label, value }) => (
  <div className="designdetail-design-info-item">
    <div className="designdetail-design-info-label">{label}</div>
    <div className="designdetail-design-info-value">
      {typeof value === 'number' ? value.toFixed(label === 'Layers' ? 0 : 2) : value}
    </div>
  </div>
);

/**
 * 根据 value 获取 Cell Design 的 label
 */
const getCellDesignLabel = (value: string): string => {
  const option = CELL_DESIGN_OPTIONS.find((opt) => opt.value === value);
  console.log(option);
  return option?.label || value;
};

/**
 * 根据 value 获取 Cathode Material 的 label
 */
const getCathodeMaterialLabel = (value: string): string => {
  const option = CATHODE_ACTIVE_MATERIAL_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

const formatNpRatio = (value?: number | string): string => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : String(value ?? '-');
};

const DesignDetailsModal: React.FC<DesignDetailsModalProps> = ({
  visible,
  data,
  rank,
  cellDesign,
  npRatio,
  cathodeActiveMaterial,
  anodeMaterialLabel,
  width,
  length,
  loading,
  onClose,
}) => {
  const { t } = useTranslation();
  const displayNpRatio = formatNpRatio(data?.np_ratio ?? npRatio);

  return (
    <Modal
      title={
        data
          ? `${t('design.electrode.optimize.designDetails')} - ${t('design.electrode.optimize.no')} #${rank}`
          : t('design.electrode.optimize.designDetails')
      }
      open={visible}
      centered
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ maxWidth: 1100 }}
      className="design-details-modal"
    >
      {loading ? (
        <div className="designdetail-loading">
          <Spin size="large" />
        </div>
      ) : data ? (
        <div className="designdetail-content">
          {/* Performance Prediction */}
          <div className="designdetail-section">
            <h3 className="designdetail-section-title">Performance Prediction</h3>
            <div className="designdetail-performance-grid">
              <PerformanceCard
                label="Design Capacity"
                value={data.design_capacity}
                unit="Ah"
              />
              <PerformanceCard
                label="Specific E.D."
                value={data.specific_ED}
                unit="Wh/kg"
              />
              <PerformanceCard
                label="Jelly Roll Thickness"
                value={data.jelly_roll_thickness}
                unit="mm"
              />
              <PerformanceCard
                label="Volumetric E.D."
                value={data.volumetric_ED}
                unit="Wh/L"
              />
            </div>
          </div>

          {/* Design */}
          <div className="designdetail-section">
            <h3 className="designdetail-section-title">Design</h3>
            <div className="designdetail-design-grid">
              <DesignInfoItem label="Cell Type" value={getCellDesignLabel(cellDesign)} />
              <DesignInfoItem label="NP Ratio" value={displayNpRatio} />
              <DesignInfoItem
                label="Cathode Material"
                value={getCathodeMaterialLabel(cathodeActiveMaterial)}
              />
              <DesignInfoItem
                label="Anode Material"
                value={anodeMaterialLabel}
              />
              <DesignInfoItem label="Width (mm)" value={Number(width)} />
              <DesignInfoItem label="Length (mm)" value={Number(length)} />
              <DesignInfoItem label="Layers" value={data.layers} />
            </div>
          </div>

          {/* Cathode & Anode */}
            <div className="designdetail-electrodes-grid">
            {/* Cathode */}
            <div className="designdetail-electrode-section">
              <h3 className="designdetail-electrode-title designdetail-cathode-title">
                Cathode
              </h3>
              <div className="designdetail-parameters">
                <ParameterItem label="PVDF (wt.%)" value={data.cathode_binder_wt} />
                <ParameterItem label="CNT (wt.%)" value={data.cathode_cnt_wt} />
                <ParameterItem
                  label="Carbon black (wt.%)"
                  value={data.cathode_conductive_carbon_wt}
                />
                <ParameterItem
                  label="Areal Loading (mAh/cm²)"
                  value={data.cathode_areal_loading}
                />
                <ParameterItem
                  label="Press Density (g/cc)"
                  value={data.cathode_press_density}
                />
              </div>
            </div>

            {/* Anode */}
            <div className="designdetail-electrode-section">
              <h3 className="designdetail-electrode-title designdetail-anode-title">
                Anode
              </h3>
              <div className="designdetail-parameters">
                <ParameterItem label="CMC (wt.%)" value={data.anode_binder1_wt} />
                <ParameterItem label="SBR (wt.%)" value={data.anode_binder2_wt} />
                <ParameterItem label="PAA (wt.%)" value={data.anode_binder3_wt} />
                <ParameterItem
                  label="Carbon black (wt.%)"
                  value={data.anode_conductive_carbon_wt}
                />
                <ParameterItem
                  label="CNT (wt.%)"
                  value={data.anode_cnt_wt}
                />
                <ParameterItem
                  label="Press Density (g/cc)"
                  value={data.anode_press_density}
                />
              </div>
              </div>
            </div>

            {hasRateCapabilityData(data) && (
              <div className="designdetail-section">
                <RateCapabilityChart
                  results={data}
                  missingDataBehavior="hide"
                />
              </div>
            )}
          </div>
      ) : null}
    </Modal>
  );
};

export default DesignDetailsModal;
