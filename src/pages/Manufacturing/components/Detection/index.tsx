import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import TreeView, { TreeNode } from '../TreeView';
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

interface TableRow {
  type_nr: string;
  oh_value: string;
}

interface SplitTableData {
  left: TableRow[];
  right: TableRow[];
}

// 解析 CSV 数据
const parseCSV = (csvText: string): SplitTableData => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const typeIndex = headers.indexOf('type');
  const typeNrIndex = headers.indexOf('type_nr');
  const ohValueIndex = headers.indexOf('oh_value');

  if (typeIndex === -1 || typeNrIndex === -1 || ohValueIndex === -1) {
    return { left: [], right: [] };
  }

  const leftData: TableRow[] = [];
  const rightData: TableRow[] = [];

  lines.slice(1).forEach((line) => {
    if (!line.trim()) return;
    const values = line.split(',');
    const type = values[typeIndex];
    const rowData = {
      type_nr: values[typeNrIndex],
      oh_value: values[ohValueIndex],
    };

    if (type === 'left') {
      leftData.push(rowData);
    } else if (type === 'right') {
      rightData.push(rowData);
    }
  });

  return { left: leftData, right: rightData };
};

type ImageType = 'raw' | 'point' | 'fullmark';

const Detection: React.FC<DetectionProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('0');
  const [imageType, setImageType] = useState<ImageType>('raw');
  const [csvData, setCsvData] = useState<Record<string, SplitTableData>>({});

  // 模拟 Tree 数据（在最外侧增加 Detection List 父层）
  const mockTreeData: TreeNode[] = useMemo(
    () => [
      {
        id: 'detection-list',
        label: t('manufacturing.modules.detection.result.tree.title'),
        children: Array.from({ length: 12 }, (_, i) => ({
          id: String(i),
          label: `${i}`,
        })),
      },
    ],
    [t],
  );

  // 加载 CSV 数据
  useEffect(() => {
    const loadCSVData = async (id: string) => {
      try {
        const response = await fetch(`/manufacturing/detection/${id}_data.csv`);
        if (response.ok) {
          const text = await response.text();
          const data = parseCSV(text);
          setCsvData((prev) => ({ ...prev, [id]: data }));
        }
      } catch (error) {
        console.error(`Failed to load CSV data for ${id}:`, error);
      }
    };

    // 提取根节点 ID
    const rootId = selectedNodeId.split('-')[0];
    if (!csvData[rootId]) {
      loadCSVData(rootId);
    }
  }, [selectedNodeId, csvData]);

  // 当前选中节点的表格数据
  const tableData = useMemo(() => {
    const rootId = selectedNodeId.split('-')[0];
    return csvData[rootId] || { left: [], right: [] };
  }, [selectedNodeId, csvData]);

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

  // 获取当前选中节点的 index（用于参考线）
  const currentIndex = useMemo(() => {
    // 提取根节点 ID（如 "0-1" -> "0"，"detection-list" -> null）
    const rootId = selectedNodeId.split('-')[0];
    const index = parseInt(rootId, 10);
    return isNaN(index) ? undefined : index;
  }, [selectedNodeId]);

  // 获取 ECharts 配置
  const defectTrendOption = useMemo(
    () => getDefectTrendConfig(t, currentIndex),
    [t, currentIndex],
  );
  const confidenceOption = useMemo(
    () => getConfidenceConfig(t, currentIndex),
    [t, currentIndex],
  );
  const areaDistributionOption = useMemo(
    () => getAreaDistributionConfig(t, currentIndex),
    [t, currentIndex],
  );
  const timeSeriesOption = useMemo(
    () => getTimeSeriesConfig(t, currentIndex),
    [t, currentIndex],
  );

  return (
    <div className="detection-result-layout">
      {/* 左侧：Tree 组件 */}
      <div className="detection-left-panel">
        <TreeView
          data={mockTreeData}
          max={10}
          selectedId={selectedNodeId}
          onSelect={handleNodeSelect}
          defaultExpandedKeys={['detection-list']}
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
                {t('manufacturing.modules.detection.result.imageViewer.imageLoadError')}
                <br />
                <small>{imagePath}</small>
              </div>
            </div>
          </div>

          {/* 右侧：双表格 */}
          <div className="detection-table-section">
            <div className="table-header">
              {t('manufacturing.modules.detection.result.table.title')}
            </div>
            <div className="dual-table-wrapper">
              <div className="single-table-container">
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>Left OH (mm)</th>
                        <th style={{ width: '50%' }}>Right OH (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Math.max(tableData.left.length, tableData.right.length) > 0 ? (
                        Array.from({
                          length: Math.max(tableData.left.length, tableData.right.length),
                        }).map((_, index) => (
                          <tr key={index}>
                                                                                <td>{tableData.left[index]?.oh_value || ''}</td>
                                                                                <td>{tableData.right[index]?.oh_value || ''}</td>                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                            {t('manufacturing.modules.detection.result.table.noData')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detection;
