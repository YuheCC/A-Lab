import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Button from '@/components/Button';
import { useMessage } from '@/components/MessageProvider';
import ParameterInput from '../Predict/components/ParameterInput';
import DesignDetailsModal from './components/DesignDetailsModal';
import { getOptimizeRecommendations, getOptimizeDetail } from './model';
import {
  DesignTargetsFormData,
  DesignRecommendation,
  DesignDetails,
  PARAMETER_RANGES,
} from './types';
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
  ANODE_ACTIVE_MATERIAL_OPTIONS,
  getNpRatioByCellDesign,
  DEFAULT_VALUES,
} from '../constants';
import './index.less';

const { Option } = Select;

const OptimizePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const message = useMessage();

  // 表单状态
  const [formData, setFormData] = useState<DesignTargetsFormData>({
    cellDesign: DEFAULT_VALUES.cellDesign,
    npRatio: DEFAULT_VALUES.npRatio,
    anodeActiveMaterial: DEFAULT_VALUES.anodeActiveMaterial,
    cathodeActiveMaterial: DEFAULT_VALUES.cathodeActiveMaterial,
    width: '',
    length: '',
    layers: '',
    designCapacity: PARAMETER_RANGES.designCapacity.default,
    specificEnergy: PARAMETER_RANGES.specificEnergy.default,
    thickness: PARAMETER_RANGES.thickness.default,
    volumetricEnergyDensity: PARAMETER_RANGES.volumetricEnergyDensity.default,
  });

  // 根据 Cell Design 自动更新 NP Ratio
  useEffect(() => {
    const npRatio = getNpRatioByCellDesign(formData.cellDesign);
    setFormData((prev) => ({ ...prev, npRatio }));
  }, [formData.cellDesign]);

  // 推荐结果状态
  const [recommendations, setRecommendations] = useState<DesignRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal 状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<DesignDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // 处理计算
  const handleCalculate = async () => {
    // 验证表单
    if (!formData.cellDesign || !formData.anodeActiveMaterial || !formData.cathodeActiveMaterial) {
      message.error(t('design.electrode.optimize.messages.fillAllFields'));
      return;
    }
    
    // 验证 Cathode Dimension 字段
    if (!formData.width || !formData.length || !formData.layers) {
      message.error(t('design.electrode.optimize.messages.fillAllDimensions'));
      return;
    }

    setLoading(true);
    try {
      const response = await getOptimizeRecommendations(formData);
      setRecommendations(response.data);
      message.success(t('design.electrode.optimize.messages.calculateSuccess'));
    } catch (error) {
      console.error('Calculate error:', error);
      message.error(t('design.electrode.optimize.messages.calculateError'));
    } finally {
      setLoading(false);
    }
  };

  // 处理查看详情
  const handleViewDetails = async (record: DesignRecommendation) => {
    setModalVisible(true);
    setModalLoading(true);
    setSelectedDesign(null);

    try {
      const response = await getOptimizeDetail(record.id);
      setSelectedDesign(response.data);
    } catch (error) {
      console.error('Load details error:', error);
      message.error(t('design.electrode.optimize.messages.loadDetailsError'));
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<DesignRecommendation> = [
    {
      title: t('design.electrode.optimize.rank'),
      dataIndex: 'rank',
      width: 80,
      align: 'center',
    },
    {
      title: t('design.electrode.optimize.designCapacity') + ' (mAh)',
      dataIndex: 'designCapacity',
      width: 180,
      render: (value: number) => value.toFixed(0),
    },
    {
      title: t('design.electrode.optimize.specificEnergy') + ' (Wh/kg)',
      dataIndex: 'specificEnergy',
      width: 200,
      render: (value: number) => value.toFixed(0),
    },
    {
      title: t('design.electrode.optimize.thickness') + ' (mm)',
      dataIndex: 'thickness',
      width: 150,
      render: (value: number) => value.toFixed(1),
    },
    {
      title: t('design.electrode.optimize.volumetricEnergyDensity') + ' (Wh/L)',
      dataIndex: 'volumetricEnergyDensity',
      width: 220,
      render: (value: number) => value.toFixed(0),
    },
    {
      title: t('design.electrode.optimize.actions'),
      width: 100,
      render: (_: any, record: DesignRecommendation) => (
        <a className="details-link" onClick={() => handleViewDetails(record)}>
          {t('design.electrode.optimize.details')}
        </a>
      ),
    },
  ];

  return (
    <div className="electrode-optimize-container">
      {/* 标题和返回按钮 */}
      <div className="electrode-optimize-actions">
        <h1 className="electrode-optimize-title">
          {t('design.electrode.optimize.title')}
        </h1>
        <button className="electrode-optimize-back-btn" onClick={() => navigate(-1)}>
          <LeftOutlined style={{ marginRight: 8 }} />
          {t('design.electrode.optimize.back')}
        </button>
      </div>

      {/* 内容区域 */}
      <div className="electrode-optimize-content">
        {/* Performance Targets 区域 */}
        <div className="electrode-optimize-section">
          <h2 className="electrode-optimize-section-title">
            {t('design.electrode.optimize.performanceTargets')}
          </h2>

          <div className="electrode-optimize-form-container">
            {/* Cell Information 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.cellInformation')}
              </h3>

              {/* Cell Type 和 NP Ratio - 两列布局 */}
              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cellType')}
                  </label>
                  <Select
                    value={formData.cellDesign}
                    onChange={(value) => setFormData({ ...formData, cellDesign: value })}
                    placeholder={t('design.electrode.optimize.selectCellDesign')}
                    className="electrode-optimize-select"
                  >
                    {CELL_DESIGN_OPTIONS.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.npRatio')}
                  </label>
                  <input
                    type="text"
                    value={formData.npRatio}
                    disabled
                    className="electrode-optimize-input electrode-optimize-input--disabled"
                  />
                </div>
              </div>

              {/* Cathode Active Material 和 Anode Active Material - 两列布局 */}
              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cathodeActiveMaterial')}
                  </label>
                  <Select
                    value={formData.cathodeActiveMaterial}
                    onChange={(value) => setFormData({ ...formData, cathodeActiveMaterial: value })}
                    placeholder={t('design.electrode.optimize.selectMaterial')}
                    className="electrode-optimize-select"
                  >
                    {CATHODE_ACTIVE_MATERIAL_OPTIONS.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.anodeActiveMaterial')}
                  </label>
                  <Select
                    value={formData.anodeActiveMaterial}
                    onChange={(value) => setFormData({ ...formData, anodeActiveMaterial: value })}
                    placeholder={t('design.electrode.optimize.selectMaterial')}
                    className="electrode-optimize-select"
                  >
                    {ANODE_ACTIVE_MATERIAL_OPTIONS.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Cathode Dimension 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.cathodeDimension')}
              </h3>

              <div className="electrode-optimize-form-row electrode-optimize-form-row--triple">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.width')}
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder={t('design.electrode.optimize.enterWidth')}
                    className="electrode-optimize-input"
                  />
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.length')}
                  </label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    placeholder={t('design.electrode.optimize.enterLength')}
                    className="electrode-optimize-input"
                  />
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.layers')}
                  </label>
                  <input
                    type="number"
                    value={formData.layers}
                    onChange={(e) => setFormData({ ...formData, layers: e.target.value })}
                    placeholder={t('design.electrode.optimize.enterLayers')}
                    className="electrode-optimize-input"
                  />
                </div>
              </div>
            </div>

            {/* Targets 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.targets')}
              </h3>

              {/* 参数滑块 */}
              <div className="electrode-optimize-parameters">
                <ParameterInput
                  label={`${t('design.electrode.optimize.designCapacity')} (Ah)`}
                  value={formData.designCapacity}
                  onChange={(value) => setFormData({ ...formData, designCapacity: value })}
                  min={PARAMETER_RANGES.designCapacity.min}
                  max={PARAMETER_RANGES.designCapacity.max}
                  step={PARAMETER_RANGES.designCapacity.step}
                />
                <ParameterInput
                  label={`${t('design.electrode.optimize.specificEnergy')} (Wh/kg)`}
                  value={formData.specificEnergy}
                  onChange={(value) => setFormData({ ...formData, specificEnergy: value })}
                  min={PARAMETER_RANGES.specificEnergy.min}
                  max={PARAMETER_RANGES.specificEnergy.max}
                  step={PARAMETER_RANGES.specificEnergy.step}
                />
                <ParameterInput
                  label={`${t('design.electrode.optimize.jellyRollThickness')} (mm)`}
                  value={formData.thickness}
                  onChange={(value) => setFormData({ ...formData, thickness: value })}
                  min={PARAMETER_RANGES.thickness.min}
                  max={PARAMETER_RANGES.thickness.max}
                  step={PARAMETER_RANGES.thickness.step}
                />
                <ParameterInput
                  label={`${t('design.electrode.optimize.volumetricEnergyDensity')} (Wh/L)`}
                  value={formData.volumetricEnergyDensity}
                  onChange={(value) => setFormData({ ...formData, volumetricEnergyDensity: value })}
                  min={PARAMETER_RANGES.volumetricEnergyDensity.min}
                  max={PARAMETER_RANGES.volumetricEnergyDensity.max}
                  step={PARAMETER_RANGES.volumetricEnergyDensity.step}
                />
              </div>
            </div>

            {/* Calculate 按钮 */}
            <div className="electrode-optimize-calculate-btn-wrapper">
              <Button
                variant="primary"
                size="large"
                onClick={handleCalculate}
                loading={loading}
                className="electrode-optimize-calculate-btn"
              >
                {t('design.electrode.optimize.calculate')}
              </Button>
            </div>
          </div>
        </div>

        {/* Design Recommendations 表格 */}
        <div className="electrode-optimize-section">
          <h2 className="electrode-optimize-section-title">
            {t('design.electrode.optimize.designRecommendations')}
          </h2>
          <Table
            columns={columns}
            dataSource={recommendations}
            rowKey="id"
            pagination={false}
            className="electrode-optimize-table"
          />
        </div>
      </div>

      {/* 详情 Modal */}
      <DesignDetailsModal
        visible={modalVisible}
        data={selectedDesign}
        loading={modalLoading}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default OptimizePage;
