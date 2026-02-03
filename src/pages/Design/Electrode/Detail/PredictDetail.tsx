import React from 'react';
import type { TFunction } from 'i18next';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Input } from 'antd';
import ParameterInput from '../Predict/components/ParameterInput';
import ResultDisplay from '../Predict/components/ResultDisplay';
import RateCapabilityChart from '../Predict/components/RateCapabilityChart';
import type { ElectrodeHistoryItem } from '../model';
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
  ANODE_ACTIVE_MATERIAL_OPTIONS,
} from '../constants';
import './index.less';

const { Option } = Select;

interface PredictDetailProps {
  t: TFunction;
  predictData: ElectrodeHistoryItem;
  npRatio: string;
  onGoBack: () => void;
}

const PredictDetail: React.FC<PredictDetailProps> = ({
  t,
  predictData,
  npRatio,
  onGoBack,
}) => {
  const { cell_design, cathode_active_material, anode_active_material, model_params, model_result } = predictData;

  return (
    <div className="electrode-predict-container antd-readonly-style">
      {/* 页面标题和返回按钮 */}
      <div className="electrode-predict-actions">
        <h1 className="electrode-predict-title">
          {t('design.electrode.predict.title', 'Result Prediction')}
        </h1>
        <button className="electrode-predict-back-btn" onClick={onGoBack}>
          <LeftOutlined style={{ marginRight: 8 }} />
          {t('design.electrode.predict.back', '返回')}
        </button>
      </div>

      <div className="electrode-predict-content">
        {/* 操作区域 */}
        <div className="electrode-predict-operation-area">
          {/* Electrode Design 部分 */}
          <div className="electrode-predict-section">
            <h2 className="electrode-predict-section-title">
              {t('design.electrode.predict.electrodeDesign', 'Electrode Design')}
            </h2>

            <div className="electrode-predict-form-container">
              {/* Cell Design 和 NP Ratio 并排 */}
              <div className="electrode-predict-electrode-grid">
                <div className="electrode-predict-form-item">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.cellDesign', 'Cell Design')}
                  </label>
                  <Select
                    disabled
                    value={cell_design}
                    className="electrode-predict-select"
                  >
                    {CELL_DESIGN_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="electrode-predict-form-item">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.npRatio', 'NP Ratio')}
                  </label>
                  <Input
                    disabled
                    type="number"
                    value={npRatio}
                    className="electrode-predict-input"
                  />
                </div>
              </div>

              {/* 阳极和阴极区域 */}
              <div className="electrode-predict-electrode-grid">
                {/* 阴极区域 */}
                <div className="electrode-predict-electrode-section">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.cathodeActiveMaterial', 'Cathode Active Material')}
                  </label>
                  <Select
                    disabled
                    value={cathode_active_material}
                    className="electrode-predict-select"
                  >
                    {CATHODE_ACTIVE_MATERIAL_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>

                  <h3 className="electrode-predict-subsection-title">
                    {t('design.electrode.predict.cathodeParameters', 'Cathode Parameters')}
                  </h3>

                  <div className="electrode-predict-parameters-container">
                    <ParameterInput
                      label={t('design.electrode.predict.kf9700', 'KF-9700 (wt.%)')}
                      value={model_params.cathodeKF9700}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.cn01y', 'CN-01Y (wt.%)')}
                      value={model_params.cathodeCN01Y}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.superC65', 'Super C65 (wt.%)')}
                      value={model_params.cathodeSuperC65}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.cathodeActiveMaterialLabel', 'Active Material NCM-A (%)')}
                      value={model_params.cathodeNCMA}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.arealLoading', 'Areal Loading (mAh/cm²)')}
                      value={model_params.cathodeArealLoading}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                      value={model_params.cathodePressDensity}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      readonly={true}
                    />
                  </div>

                  {/* 电解液参数模块 */}
                  <h3 className="electrode-predict-subsection-title">
                    {t('design.electrode.predict.electrolyteParameters', 'Electrolyte Parameters')}
                  </h3>

                  <div className="electrode-predict-parameters-container">
                    <ParameterInput
                      label={t('design.electrode.predict.electrolyteContent', 'Electrolyte Content (g/Ah)')}
                      value={2.322}
                      onChange={() => {}}
                      min={0}
                      max={2.322}
                      readonly={true}
                    />
                  </div>
                </div>

                {/* 阳极区域 */}
                <div className="electrode-predict-electrode-section">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.anodeActiveMaterial', 'Anode Active Material')}
                  </label>
                  <Select
                    disabled
                    value={anode_active_material}
                    className="electrode-predict-select"
                  >
                    {ANODE_ACTIVE_MATERIAL_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>

                  <h3 className="electrode-predict-subsection-title">
                    {t('design.electrode.predict.anodeParameters', 'Anode Parameters')}
                  </h3>

                  <div className="electrode-predict-parameters-container">
                    <ParameterInput
                      label={t('design.electrode.predict.cmc', 'CMC (wt.%)')}
                      value={model_params.anodeCMC}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.sbr', 'SBR (wt.%)')}
                      value={model_params.anodeSBR}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.paa', 'PAA (wt.%)')}
                      value={model_params.anodePAA}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.superP', 'Super P (wt.%)')}
                      value={model_params.anodeSuperP}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.swcnt', 'SWCNT (wt.%)')}
                      value={model_params.anodeSWCNT}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.activeMaterial1', 'Active material-1 SC-B-I (%)')}
                      value={model_params.anodeSCBI}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.activeMaterial2', 'Active material-2 Gr-S-I (%)')}
                      value={model_params.anodeGrSI}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.anodeArealLoading', 'Areal Loading (mAh/cm²)')}
                      value={model_params.anodeArealLoading}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      readonly={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                      value={model_params.anodePressDensity}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      readonly={true}
                    />
                  </div>
                </div>
              </div>

              {/* Dimension 区域 */}
              <div className="electrode-predict-dimension-section">
                <h3 className="electrode-predict-subsection-title">
                  {t('design.electrode.predict.dimension', 'Dimension')}
                </h3>
                <div className="electrode-predict-dimension-grid">
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label">
                      {t('design.electrode.predict.width', 'Width (mm)')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.width}
                    />
                  </div>
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label">
                      {t('design.electrode.predict.length', 'Length (mm)')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.length}
                    />
                  </div>
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label">
                      {t('design.electrode.predict.layers', 'Layers')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.layers}
                    />
                  </div>
                </div>
              </div>

              {/* 不显示 Calculate 按钮 */}
            </div>
          </div>

          {/* Cell Performance Prediction 部分 - 始终显示 */}
          <div className="electrode-predict-section">
            <h2 className="electrode-predict-section-title">
              {t('design.electrode.predict.cellPerformance', 'Cell Performance Prediction')}
            </h2>

            <div className="electrode-predict-results-container">
              <div className="electrode-predict-results-grid">
                <ResultDisplay
                  label={t('design.electrode.predict.designCapacity', 'Design Capacity')}
                  value={model_result.designCapacity}
                  unit="Ah"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.specificED', 'Specific E.D.')}
                  value={model_result.specificED}
                  unit="Wh/kg"
                  tooltip={t('design.electrode.predict.specificEDTooltip', 'Energy density calculated based on total cell mass, including pouch materials, electrolyte, and auxiliary inactive components. Electrolyte loading is ~41% excessive relative to the active area.')}
                />
                <ResultDisplay
                  label={t('design.electrode.predict.jellyRollThickness', 'Jelly Roll Thickness')}
                  value={model_result.jellyRollThickness}
                  unit="mm"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.volumetricED', 'Volumetric E.D.')}
                  value={model_result.volumetricED}
                  unit="Wh/L"
                  tooltip={t('design.electrode.predict.volumetricEDTooltip', 'Energy density calculated based on the jelly roll volume.')}
                />
              </div>

              {/* Rate Capability 图表 */}
              <RateCapabilityChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictDetail;
