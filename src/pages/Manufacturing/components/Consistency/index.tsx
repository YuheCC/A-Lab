import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin, message, Select, Tabs } from 'antd';
import TreeView, { TreeNode } from '../TreeView';
import './index.less';

interface ConsistencyProps {
  onBackToIntro?: () => void;
}

interface PredictResultData {
  barcode: string;
  predict: string;
  actual: string;
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
    { start: 400, end: 442 }
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
  const [predictData, setPredictData] = useState<PredictResultData[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number>(0);
  const [featureImageLoading, setFeatureImageLoading] = useState<boolean>(false);
  const [featureImageError, setFeatureImageError] = useState<boolean>(false);

  // 生成 Tree 数据
  const treeData = useMemo(() => generateTreeData(), []);

  // 解析 CSV 数据
  const parseCSV = (csvText: string): PredictResultData[] => {
    const lines = csvText.trim().split('\n');
    const data: PredictResultData[] = [];

    // 跳过表头，从第二行开始解析
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [barcode, predict, actual] = line.split(',');
        data.push({
          barcode: barcode.trim(),
          predict: predict.trim(),
          actual: actual.trim(),
        });
      }
    }

    return data;
  };

  // 加载预测结果数据
  useEffect(() => {
    const loadPredictData = async () => {
      setTableLoading(true);
      try {
        const response = await fetch('/manufacturing/consistency/predictResult.csv');
        if (!response.ok) {
          throw new Error('Failed to load predict result data');
        }
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setPredictData(parsedData);
      } catch (error) {
        console.error('Error loading predict data:', error);
        message.error(t('manufacturing.messages.loadDataFailed'));
      } finally {
        setTableLoading(false);
      }
    };

    loadPredictData();
  }, []);

  // 加载特征列表数据
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const response = await fetch('/manufacturing/consistency/feature/features.csv');
        if (!response.ok) {
          throw new Error('Failed to load features data');
        }
        const csvText = await response.text();
        const lines = csvText.trim().split('\n').filter(line => line.trim());
        setFeatures(lines);
      } catch (error) {
        console.error('Error loading features:', error);
        message.error(t('manufacturing.messages.loadDataFailed'));
      }
    };

    loadFeatures();
  }, []);

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

  // 获取当前选择的样本数据
  const currentSampleData = useMemo(() => {
    return predictData.find(item => item.barcode === String(selectedSampleIndex));
  }, [predictData, selectedSampleIndex]);

  /**
   * 翻译状态值
   * @param value 原始状态值（异常/正常）
   * @returns 翻译后的状态值
   */
  const translateStatus = (value: string): string => {
    if (value === '异常') {
      return t('manufacturing.status.abnormal');
    } else if (value === '正常') {
      return t('manufacturing.status.normal');
    }
    return value;
  };

  return (
    <div className="consistency-result">
      {/* Tabs 导航 */}
      <Tabs
        defaultActiveKey="feature-analysis"
        style={{ marginBottom: '16px' }}
        items={[
          {
            key: 'feature-analysis',
            label: t('manufacturing.tabs.batchSummary'),
            children: (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* SHAP特征重要性图表 */}
                <div className="chart-wrapper" style={{
                  flex: '1 1 45%',
                  minWidth: '400px',
                  minHeight: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff'
                }}>
                  <h3 className="chart-title" style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 500 }}>
                    {t('manufacturing.charts.shap.title')}
                  </h3>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
                    <img
                      src="/manufacturing/consistency/images/summary.png"
                      alt="SHAP Feature Importance Summary"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ marginTop: '16px', lineHeight: '1.6', color: '#555', fontSize: '13px' }}>
                    <p style={{ marginBottom: '8px' }}>{t('manufacturing.charts.shap.summaryDescription1')}</p>
                    <p>{t('manufacturing.charts.shap.summaryDescription2')}</p>
                  </div>
                </div>

                {/* 特征详细分析 */}
                <div className="chart-wrapper" style={{
                  flex: '1 1 45%',
                  minWidth: '400px',
                  minHeight: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 className="chart-title" style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>
                      {t('manufacturing.charts.featureDetailAnalysis.title')}
                    </h3>
                    <Select
                      style={{ width: '100%' }}
                      value={selectedFeatureIndex}
                      onChange={(value) => {
                        setSelectedFeatureIndex(value);
                        setFeatureImageError(false);
                      }}
                      placeholder="请选择特征"
                      options={features.map((feature, index) => ({
                        label: feature,
                        value: index
                      }))}
                    />
                  </div>
                  <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
                    {featureImageLoading && (
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
                        <Spin size="large" tip={t('manufacturing.messages.loading')} />
                      </div>
                    )}
                    {features.length > 0 && (
                      <img
                        src={`/manufacturing/consistency/feature/${selectedFeatureIndex}.png`}
                        alt={`Feature Analysis - ${features[selectedFeatureIndex]}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: featureImageError ? 'none' : 'block'
                        }}
                        onLoad={() => setFeatureImageLoading(false)}
                        onLoadStart={() => setFeatureImageLoading(true)}
                        onError={() => {
                          setFeatureImageLoading(false);
                          setFeatureImageError(true);
                          message.error(`加载特征 ${features[selectedFeatureIndex]} 图片失败`);
                        }}
                      />
                    )}
                    {featureImageError && (
                      <div style={{ color: '#999', fontSize: '14px' }}>
                        图片加载失败
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '16px', lineHeight: '1.6', color: '#555', fontSize: '13px' }}>
                    <p style={{ marginBottom: '8px' }}>{t('manufacturing.charts.featureDetailAnalysis.featureAnalysisDescription1')}</p>
                    <p>{t('manufacturing.charts.featureDetailAnalysis.featureAnalysisDescription2')}</p>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'sample-data',
            label: t('manufacturing.tabs.cellAnalysis'),
            children: (
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

                {/* 右侧：内容区域 */}
                <div className="right-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                  {/* 预测结果 */}
                  <div className="predict-result-info" style={{
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}>
                    <h3 className="section-title" style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 500 }}>
                      {t('manufacturing.predictResult.title', { index: selectedSampleIndex })}
                    </h3>
                    {tableLoading ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin />
                      </div>
                    ) : currentSampleData ? (
                      <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
                        <div>
                          <span style={{ color: '#666' }}>{t('manufacturing.predictResult.barcode')}: </span>
                          <span style={{ fontWeight: 500 }}>{currentSampleData.barcode}</span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>{t('manufacturing.predictResult.predict')}: </span>
                          <span style={{
                            fontWeight: 500,
                            color: currentSampleData.predict === '异常' ? '#ff4d4f' : '#52c41a'
                          }}>
                            {translateStatus(currentSampleData.predict)}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>{t('manufacturing.predictResult.actual')}: </span>
                          <span style={{
                            fontWeight: 500,
                            color: currentSampleData.actual === '异常' ? '#ff4d4f' : '#52c41a'
                          }}>
                            {translateStatus(currentSampleData.actual)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                        {t('manufacturing.messages.noData')}
                      </div>
                    )}
                  </div>

                  {/* 特征影响力分析图 */}
                  <div className="chart-wrapper" style={{
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e8e8e8',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#fff',
                    flexShrink: 0
                  }}>
                    <h3 className="chart-title" style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 500 }}>
                      {t('manufacturing.charts.featureImportance.title')}
                      <span style={{ color: '#1890ff', marginLeft: '8px' }}>- Sample {selectedSampleIndex}</span>
                    </h3>
                    <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
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
                          <Spin size="large" tip={t('manufacturing.messages.loading')} />
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
                          message.error(t('manufacturing.messages.imageLoadFailed', { index: selectedSampleIndex }));
                        }}
                      />
                      {imageError && (
                        <div style={{ color: '#999', fontSize: '14px' }}>
                          {t('manufacturing.messages.imageLoadError')}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '16px', lineHeight: '1.6', color: '#555', fontSize: '13px' }}>
                      <p>{t('manufacturing.charts.featureImportance.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />

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
