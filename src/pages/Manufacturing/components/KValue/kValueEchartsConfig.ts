import type { EChartsOption } from 'echarts';
import { ALL_BARCODES } from './data/barcodeList';

// Voltage 数据类型定义
export interface VoltageData {
  barcode: string;
  voltages: number[];
}

// 散点图数据类型定义
export interface ScatterDataPoint {
  x: number;
  y: number;
  color: string;
  index: number;
}

/**
 * 获取多曲线图配置
 * @param t - 多语言翻译函数
 * @param voltageDataMap - 已加载的 voltage 数据映射
 * @param selectedBarcode - 当前选中的 barcode
 * @returns ECharts 配置对象
 */
export const getMultiCurveConfig = (
  t: (key: string) => string,
  voltageDataMap: Map<string, number[]>,
  selectedBarcode?: string,
): EChartsOption => {
  // 构建 series 数组
  const series = ALL_BARCODES.map((barcode) => {
    const voltages = voltageDataMap.get(barcode) || [];
    const isSelected = barcode === selectedBarcode;

    return {
      name: barcode,
      type: 'line' as const,
      data: voltages,
      smooth: false,
      showSymbol: false,
      lineStyle: {
        color: isSelected ? '#1890ff' : '#d9d9d9',
        width: isSelected ? 2 : 1,
      },
      emphasis: {
        lineStyle: {
          width: isSelected ? 3 : 2,
        },
      },
      // 高亮曲线提升层级
      z: isSelected ? 10 : 1,
    };
  });

  return {
    title: {
      text: t('manufacturing.modules.kvalue.result.chart.title'),
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        
        const index = params[0].axisValue;
        let result = `<div style="margin-bottom: 8px; font-weight: 600;">Index: ${index}</div>`;
        
        // 优先显示选中的 barcode
        const selectedParam = params.find((p: any) => p.seriesName === selectedBarcode);
        if (selectedParam) {
          result += `<div style="color: #1890ff; font-weight: 600;">${selectedParam.seriesName}: ${selectedParam.value?.toFixed(4) || 'N/A'} V</div>`;
        }
        
        // 显示其他曲线（限制数量避免 tooltip 过长）
        const otherParams = params
          .filter((p: any) => p.seriesName !== selectedBarcode)
          .slice(0, 5);
        
        otherParams.forEach((p: any) => {
          result += `<div style="color: #999;">${p.seriesName}: ${p.value?.toFixed(4) || 'N/A'} V</div>`;
        });
        
        if (params.length > 6) {
          result += `<div style="color: #999; margin-top: 4px;">... 和其他 ${params.length - 6} 条曲线</div>`;
        }
        
        return result;
      },
    },
    legend: {
      show: false, // 由于曲线太多，隐藏 legend
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '15%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      name: t('manufacturing.modules.kvalue.result.chart.xAxisName'),
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#333',
        fontSize: 12,
        fontWeight: 500,
      },
      axisLabel: {
        fontSize: 12,
        color: '#333',
      },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: t('manufacturing.modules.kvalue.result.chart.yAxisName'),
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: '#333',
        fontSize: 12,
        fontWeight: 500,
      },
      axisLabel: {
        fontSize: 12,
        color: '#333',
        formatter: '{value} V',
      },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series,
  };
};

/**
 * 解析 CSV 文件中的 voltage 数据
 * @param csvText - CSV 文件内容
 * @returns voltage 数值数组
 */
export const parseVoltageCSV = (csvText: string): number[] => {
  const lines = csvText.trim().split('\n');
  
  // 跳过第一行（header）
  if (lines.length <= 1) {
    return [];
  }
  
  const voltages: number[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const voltage = parseFloat(parts[1]);
      if (!isNaN(voltage)) {
        voltages.push(voltage);
      }
    }
  }
  
  return voltages;
};

/**
 * 加载单个 barcode 的 CSV 数据
 * @param barcode - barcode 标识
 * @returns voltage 数据数组
 */
export const loadBarcodeData = async (barcode: string): Promise<number[]> => {
  try {
    const response = await fetch(`/manufacturing/kvalue/${barcode}.csv`);
    if (!response.ok) {
      console.warn(`Failed to load data for ${barcode}: ${response.status}`);
      return [];
    }
    const text = await response.text();
    return parseVoltageCSV(text);
  } catch (error) {
    console.error(`Error loading data for ${barcode}:`, error);
    return [];
  }
};

/**
 * 批量加载多个 barcode 的数据
 * @param barcodes - barcode 列表
 * @param onProgress - 加载进度回调
 * @returns voltage 数据映射
 */
export const loadMultipleBarcodeData = async (
  barcodes: string[],
  onProgress?: (loaded: number, total: number) => void,
): Promise<Map<string, number[]>> => {
  const dataMap = new Map<string, number[]>();
  let loaded = 0;
  
  // 分批加载，避免一次性发起太多请求
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < barcodes.length; i += BATCH_SIZE) {
    const batch = barcodes.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (barcode) => {
      const data = await loadBarcodeData(barcode);
      dataMap.set(barcode, data);
      loaded++;
      if (onProgress) {
        onProgress(loaded, barcodes.length);
      }
    });
    
    await Promise.all(promises);
  }
  
  return dataMap;
};

/**
 * 解析 scat.csv 文件内容
 * @param csvText - CSV 文件内容
 * @returns 散点图数据数组
 */
export const parseScatCSV = (csvText: string): ScatterDataPoint[] => {
  const lines = csvText.trim().split('\n');
  
  // 跳过第一行（header）
  if (lines.length <= 1) {
    return [];
  }
  
  const scatterData: ScatterDataPoint[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 4) {
      const index = parseInt(parts[0], 10);
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const color = parts[3].trim();
      
      if (!isNaN(index) && !isNaN(x) && !isNaN(y) && color) {
        scatterData.push({ x, y, color, index });
      }
    }
  }
  
  return scatterData;
};

/**
 * 获取散点图配置
 * @param t - 多语言翻译函数
 * @param scatterData - 散点图数据
 * @param selectedIndex - 当前选中的 index（可选）
 * @returns ECharts 配置对象
 */
export const getScatterConfig = (
  t: (key: string) => string,
  scatterData: ScatterDataPoint[],
  selectedIndex?: number,
): EChartsOption => {
  // 按颜色分类数据
  const redData = scatterData.filter((d) => d.color === 'red');
  const greenData = scatterData.filter((d) => d.color === 'green');
  
  // 构建 series 数组
  const series: any[] = [
    {
      name: 'NG',
      type: 'scatter',
      data: redData.map((d) => [d.x, d.y]),
      itemStyle: {
        color: '#ff4d4f',
      },
      symbolSize: 8,
      z: 2,
    },
    {
      name: 'Ok',
      type: 'scatter',
      data: greenData.map((d) => [d.x, d.y]),
      itemStyle: {
        color: '#52c41a',
      },
      symbolSize: 8,
      z: 2,
    },
  ];
  
  // 如果有选中的 index，添加高亮点
  if (selectedIndex !== undefined) {
    const selectedPoint = scatterData.find((d) => d.index === selectedIndex);
    if (selectedPoint) {
      series.push({
        name: 'Selected',
        type: 'scatter',
        data: [[selectedPoint.x, selectedPoint.y]],
        itemStyle: {
          color: '#1890ff',
          borderColor: '#fff',
          borderWidth: 3,
        },
        symbolSize: 16,
        z: 10,
        tooltip: {
          formatter: () => {
            return `<div style="font-weight: 600;">Selected Point</div>
                    <div>Barcode: ${ALL_BARCODES[selectedPoint.index]}</div>
                    <div>PCA1: ${selectedPoint.x.toFixed(3)}</div>
                    <div>PCA2: ${selectedPoint.y.toFixed(3)}</div>`;
          },
        },
      });
    }
  }
  
  return {
    title: {
      text: t('manufacturing.modules.kvalue.result.scatterChart.title'),
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesName === 'Selected') {
          return params.data;
        }
        const dataIndex = params.dataIndex;
        const pointData =
          params.seriesName === 'NG'
            ? redData[dataIndex]
            : greenData[dataIndex];
        return `<div style="margin-bottom: 4px; font-weight: 600;">${params.seriesName}</div>
                <div>Barcode: ${ALL_BARCODES[pointData.index]}</div>
                <div>PCA1: ${pointData.x.toFixed(3)}</div>
                <div>PCA2: ${pointData.y.toFixed(3)}</div>`;
      },
    },
    legend: {
      data: ['NG', 'Ok'],
      top: 40,
      itemWidth: 12,
      itemHeight: 12,
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '20%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'PCA1',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#333',
        fontSize: 12,
        fontWeight: 500,
      },
      axisLabel: {
        fontSize: 12,
        color: '#333',
      },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'PCA2',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: '#333',
        fontSize: 12,
        fontWeight: 500,
      },
      axisLabel: {
        fontSize: 12,
        color: '#333',
      },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series,
  };
};

