import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import TreeView, { TreeNode } from '../TreeView';
import {
  getFirstChartConfig,
  getSecondChartConfig,
  getThirdChartConfig,
} from './ultrasoundEchartsConfig';
import './index.less';

interface UltrasoundProps {
  onBackToIntro?: () => void;
}

type ImageType = 'img1' | 'img2';

const Ultrasound: React.FC<UltrasoundProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('0');
  const [imageType, setImageType] = useState<ImageType>('img1');

  // 模拟 Tree 数据
  const mockTreeData: TreeNode[] = useMemo(
    () => [
      {
        id: 'ultrasound-list',
        label: t('manufacturing.modules.ultrasound.result.tree.title'),
        children: Array.from({ length: 12 }, (_, i) => ({
          id: String(i),
          label: `${i}`,
        })),
      },
    ],
    [t],
  );

  // 图片路径
  const imagePath = useMemo(() => {
    const rootId = selectedNodeId.split('-')[0];
    return `/manufacturing/ultrasound/${rootId}_${imageType}.jpg`;
  }, [selectedNodeId, imageType]);

  // 处理节点选择
  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNodeId(node.id);
  };

  // 处理图片类型切换
  const handleImageTypeChange = (type: ImageType) => {
    setImageType(type);
  };

  // 获取当前选中节点的 index（用于参考线）
  const currentIndex = useMemo(() => {
    const rootId = selectedNodeId.split('-')[0];
    const index = parseInt(rootId, 10);
    return isNaN(index) ? undefined : index;
  }, [selectedNodeId]);

  // 获取 ECharts 配置
  const firstChartOption = useMemo(
    () => getFirstChartConfig(t, currentIndex),
    [t, currentIndex],
  );
  const secondChartOption = useMemo(
    () => getSecondChartConfig(t, currentIndex),
    [t, currentIndex],
  );
  const thirdChartOption = useMemo(
    () => getThirdChartConfig(t, currentIndex),
    [t, currentIndex],
  );

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
        <div className="ultrasound-charts-grid">
          <div className="ultrasound-chart-card">
            <div className="chart-wrapper">
              <ReactECharts
                option={firstChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
          <div className="ultrasound-chart-card">
            <div className="chart-wrapper">
              <ReactECharts
                option={secondChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
          <div className="ultrasound-chart-card">
            <div className="chart-wrapper">
              <ReactECharts
                option={thirdChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
        </div>

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
                  className={`radio-item ${imageType === 'img1' ? 'selected' : ''}`}
                  onClick={() => handleImageTypeChange('img1')}
                >
                  <input
                    type="radio"
                    id="radio-img1"
                    name="imageType"
                    value="img1"
                    checked={imageType === 'img1'}
                    onChange={() => handleImageTypeChange('img1')}
                  />
                  <label htmlFor="radio-img1">
                    {t('manufacturing.modules.ultrasound.result.imageViewer.img1')}
                  </label>
                </div>
                <div
                  className={`radio-item ${imageType === 'img2' ? 'selected' : ''}`}
                  onClick={() => handleImageTypeChange('img2')}
                >
                  <input
                    type="radio"
                    id="radio-img2"
                    name="imageType"
                    value="img2"
                    checked={imageType === 'img2'}
                    onChange={() => handleImageTypeChange('img2')}
                  />
                  <label htmlFor="radio-img2">
                    {t('manufacturing.modules.ultrasound.result.imageViewer.img2')}
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
