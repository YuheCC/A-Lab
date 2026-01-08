import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Input, Spin, message } from 'antd';
import ParameterInput from '../components/ParameterInput';
import ResultDisplay from '../components/ResultDisplay';
import * as electrodeModel from '../../model';
import type { ElectrodeHistoryItem } from '../../model';
import './index.less';

const { Option } = Select;

const DetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ElectrodeHistoryItem | null>(null);

  // 加载详情数据
  useEffect(() => {
    const loadDetailData = async () => {
      if (!id) {
        message.error('无效的记录 ID');
        navigate(-1);
        return;
      }

      setLoading(true);
      try {
        const response = await electrodeModel.getElectrodeHistoryDetail({
          id: parseInt(id, 10),
          type: electrodeModel.PageType.RESULT_PREDICTION,
        });
        setData(response);
      } catch (error) {
        message.error('加载详情失败');
        console.error('[DetailPage] Load detail error:', error);
        // 可以选择返回或显示错误页面
        // navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 根据 Cell Design 获取 NP Ratio
  const getNpRatio = (cellDesign: string): string => {
    switch (cellDesign) {
      case 'Balanced':
        return '1.07';
      case 'High Energy':
        return '1.05';
      case 'High Power':
        return '1.10';
      default:
        return '1.07';
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="electrode-predict-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip={t('common.loading', '加载中...')} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="electrode-predict-container">
        <div className="electrode-predict-actions">
          <h1 className="electrode-predict-title">
            {t('design.electrode.predict.title', 'Result Prediction')}
          </h1>
          <button className="electrode-predict-back-btn" onClick={handleGoBack}>
            <LeftOutlined style={{ marginRight: 8 }} />
            {t('design.electrode.predict.back', '返回')}
          </button>
        </div>
        <div className="electrode-predict-content">
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {t('common.noData', '未找到记录')}
          </div>
        </div>
      </div>
    );
  }

  const { cell_design, cathode_active_material, anode_active_material, model_params, model_result } = data;
  const npRatio = getNpRatio(cell_design);

  return (
    <div className="electrode-predict-container">
      {/* 页面标题和返回按钮 */}
      <div className="electrode-predict-actions">
        <h1 className="electrode-predict-title">
          {t('design.electrode.predict.title', 'Result Prediction')}
        </h1>
        <button className="electrode-predict-back-btn" onClick={handleGoBack}>
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
                    <Option value="Balanced">Balanced</Option>
                    <Option value="High Energy">High Energy</Option>
                    <Option value="High Power">High Power</Option>
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
                    <Option value="NCM811">NCM811</Option>
                    <Option value="NCM622">NCM622</Option>
                    <Option value="LFP">LFP</Option>
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
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.cn01y', 'CN-01Y (wt.%)')}
                      value={model_params.cathodeCN01Y}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.superC65', 'Super C65 (wt.%)')}
                      value={model_params.cathodeSuperC65}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.cathodeActiveMaterialLabel', 'Active material NCM-A (%)')}
                      value={model_params.cathodeNCMA}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.arealLoading', 'Areal Loading (mAh/cm²)')}
                      value={model_params.cathodeArealLoading}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                      value={model_params.cathodePressDensity}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
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
                    <Option value="12% Si">12% Si</Option>
                    <Option value="30% Si">30% Si</Option>
                    <Option value="Si">Si</Option>
                    <Option value="Gr">Gr</Option>
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
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.sbr', 'SBR (wt.%)')}
                      value={model_params.anodeSBR}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.paa', 'PAA (wt.%)')}
                      value={model_params.anodePAA}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.superP', 'Super P (wt.%)')}
                      value={model_params.anodeSuperP}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.swcnt', 'SWCNT (wt.%)')}
                      value={model_params.anodeSWCNT}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.activeMaterial1', 'Active material-1 SC-B-I (%)')}
                      value={model_params.anodeSCBI}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.activeMaterial2', 'Active material-2 Gr-S-I (%)')}
                      value={model_params.anodeGrSI}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.anodeArealLoading', 'Areal Loading (mAh/cm²)')}
                      value={model_params.anodeArealLoading}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                      value={model_params.anodePressDensity}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
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
                    <label className="electrode-predict-label-small">
                      {t('design.electrode.predict.width', 'Width (mm)')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.width}
                    />
                  </div>
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label-small">
                      {t('design.electrode.predict.length', 'Length (mm)')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.length}
                    />
                  </div>
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label-small">
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
