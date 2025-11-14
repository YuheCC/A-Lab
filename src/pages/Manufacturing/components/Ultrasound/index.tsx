import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import TreeView, { TreeNode } from '../TreeView';
import {
  getFirstChartConfig,
  getSecondChartConfig,
  getThirdChartConfig,
  loadUltrasoundData,
  StateData,
  MarkData,
} from './ultrasoundEchartsConfig';
import './index.less';

interface UltrasoundProps {
  onBackToIntro?: () => void;
}

type ImageType = 'grays' | 'mask';

const Ultrasound: React.FC<UltrasoundProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('A37');
  const [imageType, setImageType] = useState<ImageType>('grays');
  
  // 数据加载状态
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [state1Data, setState1Data] = useState<StateData | null>(null);
  const [state2Data, setState2Data] = useState<StateData | null>(null);
  const [state3Data, setState3Data] = useState<StateData | null>(null);
  const [markData, setMarkData] = useState<MarkData | null>(null);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const data = await loadUltrasoundData();
        setState1Data(data.state1Data);
        setState2Data(data.state2Data);
        setState3Data(data.state3Data);
        setMarkData(data.markData);
      } catch (error) {
        console.error('Failed to load ultrasound data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Tree 数据 - 使用实际的节点 ID (A37, A38, A39)
  const mockTreeData: TreeNode[] = useMemo(
    () => [
      {
        id: 'ultrasound-list',
        label: t('manufacturing.modules.ultrasound.result.tree.title'),
        children: ['A37', 'A38', 'A39'].map((id) => ({
          id,
          label: id,
        })),
      },
    ],
    [t],
  );

  // 图片路径
  const imagePath = useMemo(() => {
    const extension = imageType === 'grays' ? 'png' : 'jpg';
    return `/manufacturing/ultrasound/${selectedNodeId}_${imageType}.${extension}`;
  }, [selectedNodeId, imageType]);

  // 处理节点选择
  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNodeId(node.id);
  };

  // 处理图片类型切换
  const handleImageTypeChange = (type: ImageType) => {
    setImageType(type);
  };

  // 获取当前选中节点的 ID（用于参考线）
  const currentIndex = useMemo(() => {
    // 如果选中的是子节点（A37, A38, A39），直接返回
    if (['A37', 'A38', 'A39'].includes(selectedNodeId)) {
      return selectedNodeId;
    }
    // 如果选中的是父节点，返回 undefined
    return undefined;
  }, [selectedNodeId]);

  // 获取 ECharts 配置
  const firstChartOption = useMemo(() => {
    if (!state1Data || !markData) return null;
    return getFirstChartConfig(t, state1Data, markData, currentIndex);
  }, [t, state1Data, markData, currentIndex]);

  const secondChartOption = useMemo(() => {
    if (!state2Data || !markData) return null;
    return getSecondChartConfig(t, state2Data, markData, currentIndex);
  }, [t, state2Data, markData, currentIndex]);

  const thirdChartOption = useMemo(() => {
    if (!state3Data || !markData) return null;
    return getThirdChartConfig(t, state3Data, markData, currentIndex);
  }, [t, state3Data, markData, currentIndex]);

  return (
    <div className="ultrasound-result-layout">
      {/* 左侧：Tree 组件 */}
      <div className="ultrasound-left-panel">
        <TreeView
          data={mockTreeData}
          max={10}
          selectedId={selectedNodeId}
          onSelect={handleNodeSelect}
          defaultExpandedKeys={['ultrasound-list']}
        />
      </div>

      {/* 右侧：内容区域 */}
      <div className="ultrasound-right-panel">
        {/* 上方：3 个 ECharts 图表 */}
        {dataLoading ? (
          <div className="ultrasound-loading">
            {t('manufacturing.modules.ultrasound.loading') || 'Loading...'}
          </div>
        ) : (
          <div className="ultrasound-charts-grid">
            <div className="ultrasound-chart-card">
              <div className="chart-wrapper">
                {firstChartOption && (
                  <ReactECharts
                    option={firstChartOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                )}
              </div>
            </div>
            <div className="ultrasound-chart-card">
              <div className="chart-wrapper">
                {secondChartOption && (
                  <ReactECharts
                    option={secondChartOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                )}
              </div>
            </div>
            <div className="ultrasound-chart-card">
              <div className="chart-wrapper">
                {thirdChartOption && (
                  <ReactECharts
                    option={thirdChartOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* 下方：图片展示 */}
        <div className="ultrasound-bottom-section">
          <div className="ultrasound-image-viewer">
            <div className="viewer-header">
              <div className="viewer-title">
                {t('manufacturing.modules.ultrasound.result.imageViewer.title')}
              </div>
            </div>
            <div className="image-controls">
              <div className="radio-group">
                <div
                  className={`radio-item ${imageType === 'grays' ? 'selected' : ''}`}
                  onClick={() => handleImageTypeChange('grays')}
                >
                  <input
                    type="radio"
                    id="radio-grays"
                    name="imageType"
                    value="grays"
                    checked={imageType === 'grays'}
                    onChange={() => handleImageTypeChange('grays')}
                  />
                  <label htmlFor="radio-grays">
                    {t('manufacturing.modules.ultrasound.result.imageViewer.grays')}
                  </label>
                </div>
                <div
                  className={`radio-item ${imageType === 'mask' ? 'selected' : ''}`}
                  onClick={() => handleImageTypeChange('mask')}
                >
                  <input
                    type="radio"
                    id="radio-mask"
                    name="imageType"
                    value="mask"
                    checked={imageType === 'mask'}
                    onChange={() => handleImageTypeChange('mask')}
                  />
                  <label htmlFor="radio-mask">
                    {t('manufacturing.modules.ultrasound.result.imageViewer.mask')}
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
                {t('manufacturing.modules.ultrasound.result.imageViewer.imageLoadError')}
                <br />
                <small>{imagePath}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ultrasound;
