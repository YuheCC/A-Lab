import React from 'react';
import { Modal, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { DesignDetails } from '../../types';
import './index.less';

interface DesignDetailsModalProps {
  visible: boolean;
  data: DesignDetails | null;
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
    <span className="designdetail-parameter-value">{value ?? '-'}</span>
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
      {value} <span className="designdetail-performance-unit">{unit}</span>
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
    <div className="designdetail-design-info-value">{value}</div>
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
      centered
      onCancel={onClose}
      footer={null}
      width="90%"
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
                value={data.designCapacity}
                unit="mAh"
              />
              <PerformanceCard
                label="Gravimetric Energy Density"
                value={data.gravimetricEnergyDensity}
                unit="Wh/kg"
              />
              <PerformanceCard
                label="Thickness"
                value={data.thickness}
                unit="mm"
              />
              <PerformanceCard
                label="Volumetric Energy"
                value={data.volumetricEnergy}
                unit="Wh/L"
              />
            </div>
          </div>

          {/* Design */}
          <div className="designdetail-section">
            <h3 className="designdetail-section-title">Design</h3>
            <div className="designdetail-design-grid">
              <DesignInfoItem label="Cell Type" value={data.cellDesign} />
              <DesignInfoItem label="Cathode Material" value={data.cathodeActiveMaterial} />
              <DesignInfoItem label="Anode Material" value={data.anodeActiveMaterial} />
              <DesignInfoItem label="Width (mm)" value={data.width} />
              <DesignInfoItem label="Length (mm)" value={data.length} />
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
                <ParameterItem label="PVDF (wt.%)" value={data.cathodeParameters.binder1} />
                <ParameterItem label="CNT (wt.%)" value={data.cathodeParameters.binder2} />
                <ParameterItem
                  label="Carbon black (wt.%)"
                  value={data.cathodeParameters.conductiveCarbon}
                />
                <ParameterItem
                  label="Active material (wt.%)"
                  value={data.cathodeParameters.activeMaterial}
                />
                <ParameterItem
                  label="Areal Loading (mAh/cm²)"
                  value={data.cathodeParameters.arealLoading}
                />
                <ParameterItem
                  label="Press Density (g/cc)"
                  value={data.cathodeParameters.pressDensity}
                />
              </div>
            </div>

            {/* Anode */}
            <div className="designdetail-electrode-section">
              <h3 className="designdetail-electrode-title designdetail-anode-title">
                Anode
              </h3>
              <div className="designdetail-parameters">
                <ParameterItem label="CMC (wt.%)" value={data.anodeParameters.binder1} />
                <ParameterItem label="SBR (wt.%)" value={data.anodeParameters.binder2} />
                <ParameterItem label="PAA (wt.%)" value={data.anodeParameters.binder3} />
                <ParameterItem
                  label="Carbon black (wt.%)"
                  value={data.anodeParameters.conductiveCarbon1}
                />
                <ParameterItem
                  label="CNT (wt.%)"
                  value={data.anodeParameters.conductiveCarbon2}
                />
                <ParameterItem
                  label="Active material SiC (wt.%)"
                  value={data.anodeParameters.activeMaterial1}
                />
                <ParameterItem
                  label="Active material Graphite (wt.%)"
                  value={data.anodeParameters.activeMaterial2}
                />
                <ParameterItem
                  label="Areal Loading (mAh/cm²)"
                  value={data.anodeParameters.arealLoading}
                />
                <ParameterItem
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
