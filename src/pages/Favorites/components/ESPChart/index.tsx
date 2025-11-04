import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EChartsOption } from 'echarts';
import EchartsReact from '@/components/EchartsReact';
import {
  CHART_COMMON_CONFIG,
  AXIS_LABEL_STYLE,
  CHART_TITLE_STYLE,
  SOLUBILITY_COLORS,
  ESP_REGIONS,
  calculateEllipsePath,
  truncateSmiles,
} from '../../chartConfigs';
import './index.less';

/**
 * 分子数据接口
 */
interface Molecule {
  id: string;
  smiles: string;
  esp_min_ev: number;
  esp_max_ev: number;
  homo_ev: number;
  lumo_ev: number;
  solubility?: string;
  [key: string]: any;
}

interface ESPChartProps {
  molecules: Molecule[];
  onNodeClick?: (molecule: Molecule) => void;
}

/**
 * ESP 图组件
 * 显示 ESP_MIN vs ESP_MAX 的溶解度区域分析
 */
const ESPChart: React.FC<ESPChartProps> = ({ molecules, onNodeClick }) => {
  const { t } = useTranslation();

  const option: EChartsOption = useMemo(() => {
    if (!molecules || molecules.length === 0) {
      return {};
    }

    // 过滤有效数据
    const validData = molecules.filter(
      (mol) =>
        mol.esp_min_ev !== null &&
        mol.esp_min_ev !== undefined &&
        !isNaN(mol.esp_min_ev) &&
        mol.esp_max_ev !== null &&
        mol.esp_max_ev !== undefined &&
        !isNaN(mol.esp_max_ev)
    );

    if (validData.length === 0) {
      return {};
    }

    // 按溶解度类型分组
    const groupedData: Record<string, Molecule[]> = {};
    const defaultSolubility = t('favorites.chartLabels.selectedMolecules', {
      defaultValue: 'Selected Molecules',
    });

    validData.forEach((mol) => {
      const solubility = mol.solubility || defaultSolubility;
      if (!groupedData[solubility]) {
        groupedData[solubility] = [];
      }
      groupedData[solubility].push(mol);
    });

    // 创建散点图系列
    const series: any[] = [];
    const legendOrder = ['high solubility', 'medium solubility', 'low solubility', 'diluent', defaultSolubility];

    legendOrder.forEach((solubilityType) => {
      if (groupedData[solubilityType]) {
        const typeData = groupedData[solubilityType];
        const color = SOLUBILITY_COLORS[solubilityType] || '#999';

        series.push({
          name: solubilityType,
          type: 'scatter',
          data: typeData.map((mol) => ({
            value: [mol.esp_min_ev, mol.esp_max_ev],
            molecule: mol,
            label: truncateSmiles(mol.smiles, 10),
          })),
          symbolSize: 8,
          itemStyle: {
            color: color,
            borderColor: color,
            borderWidth: 1,
          },
          emphasis: {
            itemStyle: {
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: color,
            },
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            formatter: (params: any) => params.data.label || '',
          },
        });
      }
    });

    // 绘制椭圆区域边界（使用 scatter series）
    const ellipseSeries = ESP_REGIONS.map((region) => {
      const ellipsePoints: [number, number][] = [];
      const steps = 100; // 椭圆上的点数
      const angleRad = (region.angle * Math.PI) / 180;
      const rx = region.width / 2;
      const ry = region.height / 2;
      const cx = region.center[0];
      const cy = region.center[1];

      // 生成椭圆上的点
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 2 * Math.PI;
        const x = rx * Math.cos(t);
        const y = ry * Math.sin(t);

        // 应用旋转
        const rotatedX = x * Math.cos(angleRad) - y * Math.sin(angleRad);
        const rotatedY = x * Math.sin(angleRad) + y * Math.cos(angleRad);

        ellipsePoints.push([cx + rotatedX, cy + rotatedY]);
      }

      return {
        name: `${region.label} region`,
        type: 'line',
        data: ellipsePoints,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: region.color,
          width: 2,
          type: 'dashed' as const,
        },
        areaStyle: {
          color: region.color,
          opacity: region.opacity || 0.1,
        },
        silent: true,
        z: 0,
      };
    });

    return {
      ...CHART_COMMON_CONFIG,
      title: {
        text: t('favorites.chartTitles.esp', { defaultValue: 'ESP Analysis' }),
        left: 'center',
        textStyle: CHART_TITLE_STYLE,
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (!params.data || !params.data.molecule) return '';
          const mol = params.data.molecule;
          return `
            <strong>${truncateSmiles(mol.smiles, 20)}</strong><br/>
            ESP_MIN: ${mol.esp_min_ev?.toFixed(4) || 'N/A'} eV<br/>
            ESP_MAX: ${mol.esp_max_ev?.toFixed(4) || 'N/A'} eV<br/>
            HOMO: ${mol.homo_ev?.toFixed(4) || 'N/A'} eV<br/>
            LUMO: ${mol.lumo_ev?.toFixed(4) || 'N/A'} eV<br/>
            ${mol.solubility ? `Solubility: ${mol.solubility}` : ''}
          `;
        },
      },
      legend: {
        data: [
          ...legendOrder.filter((type) => groupedData[type]),
          ...ESP_REGIONS.map((r) => `${r.label} region`),
        ],
        top: '5%',
        left: 'left',
        textStyle: AXIS_LABEL_STYLE,
      },
      xAxis: {
        type: 'value',
        name: t('favorites.chartProperties.espMin', { defaultValue: 'ESP_MIN (eV)' }),
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: AXIS_LABEL_STYLE,
        axisLabel: AXIS_LABEL_STYLE,
        splitLine: {
          lineStyle: {
            color: '#e5e5e5',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: t('favorites.chartProperties.espMax', { defaultValue: 'ESP_MAX (eV)' }),
        nameLocation: 'middle',
        nameGap: 45,
        nameTextStyle: AXIS_LABEL_STYLE,
        axisLabel: AXIS_LABEL_STYLE,
        splitLine: {
          lineStyle: {
            color: '#e5e5e5',
            type: 'dashed',
          },
        },
      },
      series: [...series, ...ellipseSeries],
    };
  }, [molecules, t]);

  // 处理点击事件
  const onEvents = useMemo(() => {
    if (!onNodeClick) return {};

    return {
      click: (params: any) => {
        if (params.data && params.data.molecule) {
          onNodeClick(params.data.molecule);
        }
      },
    };
  }, [onNodeClick]);

  if (!molecules || molecules.length === 0) {
    return (
      <div className="esp-chart-empty">
        <p>{t('favorites.noMoleculesSelected', { defaultValue: '请选择至少一个分子进行分析' })}</p>
      </div>
    );
  }

  return (
    <div className="esp-chart-container">
      <EchartsReact option={option} height="800px" width="100%" onEvents={onEvents} />
    </div>
  );
};

export default ESPChart;
