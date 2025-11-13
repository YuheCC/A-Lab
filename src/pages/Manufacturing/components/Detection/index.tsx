import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import TreeView, { TreeNode } from './TreeView';
import {
  getDefectTrendConfig,
  getConfidenceConfig,
  getAreaDistributionConfig,
  getTimeSeriesConfig,
} from './detectionEchartsConfig';
import './index.less';

interface DetectionProps {
  onBackToIntro?: () => void;
}

// 模拟 Tree 数据（12 个节点，用于测试 max=10 功能）
const mockTreeData: TreeNode[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  label: `检测批次 ${i}`,
  children: [
    { id: `${i}-1`, label: `检测点 1` },
    { id: `${i}-2`, label: `检测点 2` },
    { id: `${i}-3`, label: `检测点 3` },
  ],
}));

// 模拟 Table 数据生成函数
const generateTableData = (nodeId: string) => {
  const count = Math.floor(Math.random() * 20) + 10;
  return Array.from({ length: count }, (_, i) => ({
    index: i + 1,
    x: Math.floor(Math.random() * 1000),
    y: Math.floor(Math.random() * 800),
  }));
};

type ImageType = 'raw' | 'point' | 'fullmark';

const Detection: React.FC<DetectionProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('0');
  const [imageType, setImageType] = useState<ImageType>('raw');

  // 当前选中节点的表格数据
  const tableData = useMemo(() => {
    return generateTableData(selectedNodeId);
  }, [selectedNodeId]);

  // 图片路径
  const imagePath = useMemo(() => {
    // 提取根节点 ID（如 "0-1" -> "0"）
    const rootId = selectedNodeId.split('-')[0];
    return `/manufacturing/detection/${rootId}_${imageType}.jpg`;
  }, [selectedNodeId, imageType]);

  // 处理节点选择
  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNodeId(node.id);
  };

  // 处理图片类型切换
  const handleImageTypeChange = (type: ImageType) => {
    setImageType(type);
  };

  // 获取 ECharts 配置
  const defectTrendOption = useMemo(() => getDefectTrendConfig(t), [t]);
  const confidenceOption = useMemo(() => getConfidenceConfig(t), [t]);
  const areaDistributionOption = useMemo(() => getAreaDistributionConfig(t), [t]);
  const timeSeriesOption = useMemo(() => getTimeSeriesConfig(t), [t]);

  return (
    <div className="detection-result-layout">
      {/* 左侧：Tree 组件 */}
      <div className="detection-left-panel">
        <div className="panel-title">
          {t('manufacturing.modules.detection.result.tree.title')}
        </div>
        <TreeView
          data={mockTreeData}
          max={10}
          selectedId={selectedNodeId}
          onSelect={handleNodeSelect}
        />
      </div>

      {/* 右侧：内容区域 */}
      <div className="detection-right-panel">
        {/* 上方：4 个 ECharts 图表 */}
        <div className="detection-charts-grid">
          <div className="detection-chart-card">
            <div className="chart-wrapper">
              <ReactECharts
                option={defectTrendOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
          <div className="detection-chart-card">
            <div className="chart-wrapper">
              <ReactECharts
                option={confidenceOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
          <div className="detection-chart-card">
            <div className="chart-wrapper">
              <ReactECharts
                option={areaDistributionOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
          <div className="detection-chart-card">
            <div className="chart-wrapper">
              <ReactECharts
                option={timeSeriesOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
        </div>

        {/* 下方：图片展示 + Table */}
        <div className="detection-bottom-section">
          {/* 左侧：图片展示区 */}
          <div className="detection-image-viewer">
            <div className="viewer-header">
              <div className="viewer-title">
                {t('manufacturing.modules.detection.result.imageViewer.title')}
              </div>
            </div>
            <div className="image-controls">
              <div className="radio-group">
                <div
                  className={`radio-item ${imageType === 'raw' ? 'selected' : ''}`}
                  onClick={() => handleImageTypeChange('raw')}
                >
                  <input
                    type="radio"
                    id="radio-raw"
                    name="imageType"
                    value="raw"
                    checked={imageType === 'raw'}
                    onChange={() => handleImageTypeChange('raw')}
                  />
                  <label htmlFor="radio-raw">
                    {t('manufacturing.modules.detection.result.imageViewer.raw')}
                  </label>
                </div>
                <div
                  className={`radio-item ${imageType === 'point' ? 'selected' : ''}`}
                  onClick={() => handleImageTypeChange('point')}
                >
                  <input
                    type="radio"
                    id="radio-point"
                    name="imageType"
                    value="point"
                    checked={imageType === 'point'}
                    onChange={() => handleImageTypeChange('point')}
                  />
                  <label htmlFor="radio-point">
                    {t('manufacturing.modules.detection.result.imageViewer.point')}
                  </label>
                </div>
                <div
                  className={`radio-item ${imageType === 'fullmark' ? 'selected' : ''}`}
                  onClick={() => handleImageTypeChange('fullmark')}
                >
                  <input
                    type="radio"
                    id="radio-fullmark"
                    name="imageType"
                    value="fullmark"
                    checked={imageType === 'fullmark'}
                    onChange={() => handleImageTypeChange('fullmark')}
                  />
                  <label htmlFor="radio-fullmark">
                    {t('manufacturing.modules.detection.result.imageViewer.fullmark')}
                  </label>
                </div>
              </div>
            </div>
            <div className="image-container">
              <img
                src={imagePath}
                alt={`${imageType} view`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling;
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <div className="image-placeholder" style={{ display: 'none' }}>
                图片加载失败或不存在
                <br />
                <small>{imagePath}</small>
              </div>
            </div>
          </div>

          {/* 右侧：Table */}
          <div className="detection-table-section">
            <div className="table-header">
              {t('manufacturing.modules.detection.result.table.title')}
            </div>
            <div className="table-wrapper">
              {tableData.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>{t('manufacturing.modules.detection.result.table.index')}</th>
                      <th>{t('manufacturing.modules.detection.result.table.x')}</th>
                      <th>{t('manufacturing.modules.detection.result.table.y')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.index}>
                        <td>{row.index}</td>
                        <td>{row.x}</td>
                        <td>{row.y}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">暂无数据</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detection;
