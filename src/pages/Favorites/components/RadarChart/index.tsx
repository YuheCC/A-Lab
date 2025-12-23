import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EChartsOption } from 'echarts';
import EchartsReact from '@/components/EchartsReact';
import {
  CHART_COMMON_CONFIG,
  AXIS_LABEL_STYLE,
  LEGEND_STYLE,
  RADAR_DIMENSIONS,
  truncateSmiles,
} from '../../chartConfigs';
import './index.less';

/**
 * 分子数据接口
 */
interface Molecule {
  id: string;
  smiles: string;
  molecular_weight: number;
  homo_ev: number;
  lumo_ev: number;
  predicted_melting_point: number;
  predicted_boiling_point: number;
  [key: string]: any;
}

interface RadarChartProps {
  molecules: Molecule[];
}

/**
 * 雷达图组件
 * 显示选中分子的多维属性对比（HOMO、LUMO、熔点、沸点、分子量）
 */
const RadarChart: React.FC<RadarChartProps> = ({ molecules }) => {
  const { t } = useTranslation();

  const option: EChartsOption = useMemo(() => {
    if (!molecules || molecules.length === 0) {
      return {};
    }

    // 收集所有维度的所有数值，用于计算全局范围（与 Plotly 行为一致）
    const allValues: number[] = [];
    RADAR_DIMENSIONS.forEach((dim) => {
      molecules.forEach((mol) => {
        const value = mol[dim.key];
        if (value !== null && value !== undefined && !isNaN(value)) {
          allValues.push(value);
        }
      });
    });

    // 计算全局的最小值和最大值
    const globalMin = Math.min(...allValues);
    const globalMax = Math.max(...allValues);
    const globalRange = globalMax - globalMin;
    const globalPadding = globalRange * 0.1;

    // 准备雷达图的维度（indicator），使用统一的刻度范围
    const indicators = RADAR_DIMENSIONS.map((dim) => {
      // 使用简写名称并添加单位
      const shortName = (dim as any).shortName || dim.name;
      const nameWithUnit = dim.unit ? `${shortName} (${dim.unit})` : shortName;

      return {
        name: nameWithUnit,
        min: globalMin - globalPadding,
        max: globalMax + globalPadding,
      };
    });

    // 定义颜色方案（蓝色和橙色系）
    const colors = ['#5B8FF9', '#F4664A', '#5AD8A6', '#5D7092', '#F6BD16'];

    // 准备每个分子的数据
    const seriesData = molecules.map((molecule, index) => {
      const values = RADAR_DIMENSIONS.map((dim) => {
        const value = molecule[dim.key];
        return value !== null && value !== undefined ? value : 0;
      });

      return {
        value: values,
        name: truncateSmiles(molecule.smiles, 20),
        itemStyle: {
          color: colors[index % colors.length],
          borderWidth: 2,
        },
        lineStyle: {
          width: 2,
          color: colors[index % colors.length],
        },
        areaStyle: {
          opacity: 0.25,
          color: colors[index % colors.length],
        },
      };
    });

    return {
      ...CHART_COMMON_CONFIG,
      color: colors,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (!params.value) return '';
          const values = params.value;
          const lines = [`<strong>${params.name}</strong><br/>`];

          RADAR_DIMENSIONS.forEach((dim, index) => {
            const label = t(`favorites.chartProperties.${dim.key}`, { defaultValue: dim.name });
            const value = values[index];
            const unit = dim.unit;
            lines.push(`${label}: ${value?.toFixed(2) || 'N/A'} ${unit}`);
          });

          return lines.join('<br/>');
        },
      },
      legend: {
        ...LEGEND_STYLE,
        data: seriesData.map((item) => item.name),
        top: '5%',
        left: '5%',
        orient: 'horizontal',
        itemWidth: 25,
        itemHeight: 14,
      },
      radar: {
        indicator: indicators,
        radius: '55%',
        center: ['50%', '52%'],
        splitNumber: 4,
        shape: 'circle',
        startAngle: 70, // 从右侧开始，与 Plotly 保持一致
        name: {
          ...AXIS_LABEL_STYLE,
          color: '#666',
          fontSize: 11,
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(255, 255, 255, 0)', 'rgba(245, 245, 245, 0.5)'],
          },
        },
        splitLine: {
          lineStyle: {
            color: '#d9d9d9',
            width: 1,
          },
        },
        axisLine: {
          lineStyle: {
            color: '#d0d0d0',
            width: 1,
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
          emphasis: {
            lineStyle: {
              width: 3,
            },
            areaStyle: {
              opacity: 0.4,
            },
          },
        },
      ],
    };
  }, [molecules, t]);

  if (!molecules || molecules.length === 0) {
    return (
      <div className="radar-chart-empty">
        <p>{t('favorites.noMoleculesSelected', { defaultValue: '请选择至少一个分子进行分析' })}</p>
      </div>
    );
  }

  return (
    <div className="radar-chart-container">
      <EchartsReact option={option} height="600px" width="100%" />
    </div>
  );
};

export default RadarChart;
