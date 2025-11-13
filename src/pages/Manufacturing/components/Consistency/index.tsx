import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import TreeView, { TreeNode } from '../TreeView';
import FeatureImportance from './components/FeatureImportance';
import { getShapEchartsConfig } from './shapEchartsConfig';
import './index.less';

interface ConsistencyProps {
  onBackToIntro?: () => void;
}

// Mock 树形数据
const mockTreeData: TreeNode[] = [
  {
    id: '1',
    label: 'Production Line A',
    children: [
      { id: '1-1', label: 'Machine 1' },
      { id: '1-2', label: 'Machine 2' },
      { id: '1-3', label: 'Machine 3' },
    ],
  },
  {
    id: '2',
    label: 'Production Line B',
    children: [
      { id: '2-1', label: 'Machine 4' },
      { id: '2-2', label: 'Machine 5' },
    ],
  },
  {
    id: '3',
    label: 'Production Line C',
    children: [
      { id: '3-1', label: 'Machine 6' },
      { id: '3-2', label: 'Machine 7' },
      { id: '3-3', label: 'Machine 8' },
    ],
  },
];

const Consistency: React.FC<ConsistencyProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // 处理ECharts配置，使用多语言支持
  const chartOption = useMemo(() => {
    return getShapEchartsConfig(t);
  }, [t]);

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="consistency-result">
      {/* 完成提示 */}
      <div className="result-header">
        <div className="success-icon">✓</div>
        <h3 className="result-title">{t('manufacturing.result.complete')}</h3>
        <p className="result-desc">
          {t('manufacturing.result.fileAnalyzed')} <span className="filename">demo_data.csv</span>{' '}
          {t('manufacturing.result.fileSuccess')}
        </p>
      </div>

      {/* 主要内容区域：左侧树形视图 + 右侧图表 */}
      <div className="result-content">
        {/* 左侧：树形视图 */}
        <div className="tree-section">
          <h3 className="section-title">{t('manufacturing.result.treeView.title')}</h3>
          <div className="tree-container">
            <TreeView
              data={mockTreeData}
              selectedId={selectedNode?.id}
              onSelect={handleNodeSelect}
              defaultExpandedKeys={['1', '2', '3']}
            />
          </div>
        </div>

        {/* 右侧：图表区域 */}
        <div className="charts-section">
          {/* 上方：SHAP特征重要性图表 */}
          <div className="chart-wrapper">
            <h3 className="chart-title">{t('manufacturing.charts.shap.title')}</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ReactECharts
                option={chartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>

          {/* 下方：特征影响力分析图（根据选中节点动态变化）*/}
          <div className="chart-wrapper">
            <h3 className="chart-title">
              {t('manufacturing.charts.featureImportance.title')}
              {selectedNode && <span style={{ color: '#1890ff', marginLeft: '8px' }}>- {selectedNode.label}</span>}
            </h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <FeatureImportance nodeId={selectedNode?.id} />
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
