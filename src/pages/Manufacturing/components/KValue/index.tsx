import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import TreeView, { TreeNode } from '../TreeView';
import {
  getMultiCurveConfig,
  loadMultipleBarcodeData,
  parseScatCSV,
  getScatterConfig,
  ScatterDataPoint,
} from './kValueEchartsConfig';
import {
  ALL_BARCODES,
  CONFIGURED_BARCODE_DATA,
  MAX_VISIBLE_NODES,
  TOTAL_CSV_COUNT,
} from './data/barcodeList';
import './index.less';

interface KValueProps {
  onBackToIntro?: () => void;
}

const KValue: React.FC<KValueProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();
  const [selectedBarcode, setSelectedBarcode] = useState<string>(ALL_BARCODES[0]);
  const [voltageDataMap, setVoltageDataMap] = useState<Map<string, number[]>>(new Map());
  const [scatterData, setScatterData] = useState<ScatterDataPoint[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<{ loaded: number; total: number }>({
    loaded: 0,
    total: TOTAL_CSV_COUNT,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 构建 Tree 数据
  const treeData: TreeNode[] = useMemo(
    () => [
      {
        id: 'kvalue-list',
        label: t('manufacturing.modules.kvalue.result.tree.title'),
        children: ALL_BARCODES.map((barcode) => ({
          id: barcode,
          label: barcode,
        })),
      },
    ],
    [t],
  );

  // 加载所有 CSV 数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const dataMap = await loadMultipleBarcodeData(
        ALL_BARCODES,
        (loaded, total) => {
          setLoadingProgress({ loaded, total });
        },
      );
      setVoltageDataMap(dataMap);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // 加载散点图数据
  useEffect(() => {
    const loadScatterData = async () => {
      try {
        // 从项目源代码中读取 CSV 数据
        // 注意：这个文件需要被 Vite 处理为可访问的静态资源
        const response = await fetch(
          new URL('./data/scat.csv', import.meta.url).href,
        );
        if (!response.ok) {
          console.warn(`Failed to load scatter data: ${response.status}`);
          return;
        }
        const text = await response.text();
        const parsedData = parseScatCSV(text);
        setScatterData(parsedData);
      } catch (error) {
        console.error('Error loading scatter data:', error);
      }
    };

    loadScatterData();
  }, []);

  // 处理节点选择
  const handleNodeSelect = (node: TreeNode) => {
    // 如果选择的是根节点，不改变选中状态
    if (node.id === 'kvalue-list') {
      return;
    }
    setSelectedBarcode(node.id);
  };

  // 获取 ECharts 配置
  const multiCurveOption = useMemo(
    () => getMultiCurveConfig(t, voltageDataMap, selectedBarcode),
    [t, voltageDataMap, selectedBarcode],
  );

  // 获取当前选中 barcode 的结果数据
  const selectedBarcodeData = useMemo(() => {
    return CONFIGURED_BARCODE_DATA[selectedBarcode];
  }, [selectedBarcode]);

  // 获取当前选中的 index
  const selectedIndex = useMemo(() => {
    return selectedBarcodeData?.index;
  }, [selectedBarcodeData]);

  // 获取散点图配置
  const scatterOption = useMemo(
    () => getScatterConfig(t, scatterData, selectedIndex),
    [t, scatterData, selectedIndex],
  );

  return (
    <div className="kvalue-result-layout">
      {/* 左侧：Tree 组件 */}
      <div className="kvalue-left-panel">
        <TreeView
          data={treeData}
          max={MAX_VISIBLE_NODES}
          selectedId={selectedBarcode}
          onSelect={handleNodeSelect}
          defaultExpandedKeys={['kvalue-list']}
        />
      </div>

      {/* 右侧：内容区域 */}
      <div className="kvalue-right-panel">
        {/* 上方：散点图 */}
        <div className="kvalue-scatter-section">
          <div className="kvalue-scatter-wrapper">
            <ReactECharts
              option={scatterOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>

        {/* 中间：多曲线图 */}
        <div className="kvalue-chart-section">
          {isLoading ? (
            <div className="kvalue-loading-state">
              <div className="kvalue-loading-spinner"></div>
              <div className="kvalue-loading-text">
                {t('manufacturing.modules.kvalue.result.loading')}
              </div>
              <div className="kvalue-loading-progress">
                {loadingProgress.loaded} / {loadingProgress.total}
              </div>
            </div>
          ) : (
            <div className="kvalue-chart-wrapper">
              <ReactECharts
                option={multiCurveOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          )}
        </div>

        {/* 下方：结果 Table */}
        <div className="kvalue-table-section">
          <div className="kvalue-table-header">
            {t('manufacturing.modules.kvalue.result.table.title')}
          </div>
          <div className="kvalue-table-wrapper">
            {selectedBarcodeData ? (
              <table className="kvalue-table">
                <thead>
                  <tr>
                    <th>{t('manufacturing.modules.kvalue.result.table.barcode')}</th>
                    <th>{t('manufacturing.modules.kvalue.result.table.predict')}</th>
                    <th>{t('manufacturing.modules.kvalue.result.table.actual')}</th>
                    <th>{t('manufacturing.modules.kvalue.result.table.error')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedBarcode}</td>
                    <td>{selectedBarcodeData.predict.toFixed(8)}</td>
                    <td>{selectedBarcodeData.actual.toFixed(4)}</td>
                    <td>{selectedBarcodeData.error.toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="kvalue-empty-state">
                {t('manufacturing.modules.kvalue.result.table.noData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KValue;
