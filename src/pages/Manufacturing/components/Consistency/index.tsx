import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin, message } from 'antd';
import TreeView, { TreeNode } from '../TreeView';
import './index.less';

interface ConsistencyProps {
  onBackToIntro?: () => void;
}

/**
 * 生成两级 Tree 数据结构
 * 第一级：按百位分组（0-99, 100-199, 200-299, 300-399, 400-499, 500-565）
 * 第二级：按十位分组（0-9, 10-19, ...）
 * 第三级：叶子节点（Sample 0, Sample 1, ...）
 */
const generateTreeData = (): TreeNode[] => {
  const treeData: TreeNode[] = [];
  const ranges = [
    { start: 0, end: 99 },
    { start: 100, end: 199 },
    { start: 200, end: 299 },
    { start: 300, end: 399 },
    { start: 400, end: 499 },
    { start: 500, end: 565 },
  ];

  ranges.forEach(range => {
    const rangeNode: TreeNode = {
      id: `${range.start}-${range.end}`,
      label: `${range.start}-${range.end}`,
      children: [],
    };

    // 生成第二级：十位分组
    for (let tens = range.start; tens <= range.end; tens += 10) {
      const tensEnd = Math.min(tens + 9, range.end);
      const tensNode: TreeNode = {
        id: `${tens}-${tensEnd}`,
        label: `${tens}-${tensEnd}`,
        children: [],
      };

      // 生成第三级：叶子节点
      for (let i = tens; i <= tensEnd; i++) {
        tensNode.children!.push({
          id: `sample-${i}`,
          label: `Sample ${i}`,
          sampleIndex: i,
        });
      }

      rangeNode.children!.push(tensNode);
    }

    treeData.push(rangeNode);
  });

  return treeData;
};

const Consistency: React.FC<ConsistencyProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // 生成 Tree 数据
  const treeData = useMemo(() => generateTreeData(), []);

  /**
   * 选择样本
   * @param sampleIndex 样本索引 (0-565)
   */
  const selectSample = (sampleIndex: number) => {
    setSelectedSampleIndex(sampleIndex);
    setImageError(false);
  };

  /**
   * 处理 Tree 节点选择
   */
  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);

    // 只有叶子节点才选择样本
    if (node.sampleIndex !== undefined) {
      selectSample(node.sampleIndex);
    }
  };

  return (
    <div className="consistency-result">
      {/* 完成提示 */}
      <div className="result-header">
        <div className="success-icon">✓</div>
        <h3 className="result-title">{t('manufacturing.result.complete')}</h3>
      </div>

      {/* 主要内容区域：左侧树形视图 + 右侧图表 */}
      <div className="result-content">
        {/* 左侧：树形视图 */}
        <div className="tree-section">
          <h3 className="section-title">{t('manufacturing.result.treeView.title')}</h3>
          <div className="tree-container">
            <TreeView
              data={treeData}
              selectedId={selectedNode?.id || 'sample-0'}
              onSelect={handleNodeSelect}
              defaultExpandedKeys={['0-99', '0-9']}
            />
          </div>
        </div>

        {/* 右侧：图表区域 */}
        <div className="charts-section">
          {/* 上方：SHAP特征重要性图表 */}
          <div className="chart-wrapper">
            <h3 className="chart-title">{t('manufacturing.charts.shap.title')}</h3>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src="/manufacturing/consistency/images/summary.png"
                alt="SHAP Feature Importance Summary"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* 下方：特征影响力分析图（根据选中样本动态变化）*/}
          <div className="chart-wrapper">
            <h3 className="chart-title">
              {t('manufacturing.charts.featureImportance.title')}
              <span style={{ color: '#1890ff', marginLeft: '8px' }}>- Sample {selectedSampleIndex}</span>
            </h3>
            <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {imageLoading && (
                <div style={{
                  position: 'absolute',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1
                }}>
                  <Spin size="large" tip="加载中..." />
                </div>
              )}
              <img
                src={`/manufacturing/consistency/images/${selectedSampleIndex}.png`}
                alt={`Feature Impact Analysis - Sample ${selectedSampleIndex}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: imageError ? 'none' : 'block'
                }}
                onLoad={() => setImageLoading(false)}
                onLoadStart={() => setImageLoading(true)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                  message.error(`无法加载图片 Sample ${selectedSampleIndex}`);
                }}
              />
              {imageError && (
                <div style={{ color: '#999', fontSize: '14px' }}>
                  图片加载失败
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 分析总结 */}
      {/* <div className="analysis-summary">
        <h4 className="summary-title">{t('manufacturing.result.summary.title')}</h4>
        <ul className="summary-list">
          <li>✓ {t('manufacturing.result.summary.point1')}</li>
          <li>✓ {t('manufacturing.result.summary.point2')}</li>
          <li>⚠ {t('manufacturing.result.summary.point3')}</li>
          <li>✓ {t('manufacturing.result.summary.point4')}</li>
        </ul>
      </div> */}

      {/* 操作按钮 */}
      <div className="result-actions">
        <button className="btn-secondary" onClick={onBackToIntro}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 12l-4-4 4-4" />
          </svg>
          {t('manufacturing.result.backToIntro')}
        </button>
      </div>
    </div>
  );
};

export default Consistency;
