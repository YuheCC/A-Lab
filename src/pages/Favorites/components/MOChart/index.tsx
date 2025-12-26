import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EChartsOption } from 'echarts';
import EchartsReact from '@/components/EchartsReact';
import {
  CHART_COMMON_CONFIG,
  AXIS_LABEL_STYLE,
  CHART_TITLE_STYLE,
  SOLUBILITY_COLORS,
  REFERENCE_MOLECULES,
  generateJitter,
  truncateSmiles,
} from '../../chartConfigs';
import './index.less';

/**
 * 分子数据接口
 */
interface Molecule {
  id: string;
  smiles: string;
  homo_ev: number;
  lumo_ev: number;
  solubility?: string;
  abbreviation?: string;
  [key: string]: any;
}

interface MOChartProps {
  molecules: Molecule[];
  onNodeClick?: (molecule: Molecule) => void;
}

/**
 * MO 图组件
 * 显示 HOMO vs LUMO 的能级分析，包含参考分子对比
 */
const MOChart: React.FC<MOChartProps> = ({ molecules, onNodeClick }) => {
  const { t } = useTranslation();

  const option: EChartsOption = useMemo(() => {
    // 准备选中分子数据
    const selectedData = molecules
      .filter(
        (mol) =>
          mol.homo_ev !== null &&
          mol.homo_ev !== undefined &&
          !isNaN(mol.homo_ev) &&
          mol.lumo_ev !== null &&
          mol.lumo_ev !== undefined &&
          !isNaN(mol.lumo_ev)
      )
      .map((mol) => ({
        HOMO_EV: mol.homo_ev,
        LUMO_EV: mol.lumo_ev,
        HOMO_EV_DISPLAY: mol.homo_ev + generateJitter(),
        LUMO_EV_DISPLAY: mol.lumo_ev + generateJitter(),
        SOLUBILITY: mol.solubility || t('favorites.chartLabels.selectedMolecules', { defaultValue: 'Selected Molecules' }),
        ABBREVIATION: mol.abbreviation || truncateSmiles(mol.smiles, 10),
        SMILES: mol.smiles,
        isSelected: true,
        molecule: mol,
      }));

    // 准备参考分子数据
    const referenceData = REFERENCE_MOLECULES.map((ref) => ({
      HOMO_EV: ref.HOMO_EV,
      LUMO_EV: ref.LUMO_EV,
      HOMO_EV_DISPLAY: ref.HOMO_EV,
      LUMO_EV_DISPLAY: ref.LUMO_EV,
      SOLUBILITY: ref.SOLUBILITY,
      ABBREVIATION: ref.ABBREVIATION,
      isSelected: false,
    }));

    // X 轴和 Y 轴都不设置 min/max，让 ECharts 自动选择整洁的刻度

    // 按溶解度类型分组参考数据
    const groupedReferenceData: Record<string, typeof referenceData> = {};
    referenceData.forEach((ref) => {
      if (!groupedReferenceData[ref.SOLUBILITY]) {
        groupedReferenceData[ref.SOLUBILITY] = [];
      }
      groupedReferenceData[ref.SOLUBILITY].push(ref);
    });

    // 创建系列数据
    const series: any[] = [];
    const legendOrder = ['high solubility', 'medium solubility', 'low solubility', 'diluent'];

    // 添加参考分子系列（小圆点、半透明）
    legendOrder.forEach((solubilityType) => {
      if (groupedReferenceData[solubilityType]) {
        const typeData = groupedReferenceData[solubilityType];
        const color = SOLUBILITY_COLORS[solubilityType] || '#999';

        series.push({
          name: `${solubilityType} (${t('favorites.chartLabels.reference', { defaultValue: 'reference' }).toLowerCase()})`,
          type: 'scatter',
          data: typeData.map((d) => ({
            value: [d.HOMO_EV_DISPLAY, d.LUMO_EV_DISPLAY],
            label: d.ABBREVIATION,
          })),
          symbolSize: 6,
          itemStyle: {
            color: color,
            opacity: 0.6,
            borderColor: color,
            borderWidth: 1,
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            color: color,
            formatter: (params: any) => params.data.label || '',
          },
        });
      }
    });

    // 添加选中分子系列（星形、紫色、较大）
    if (selectedData.length > 0) {
      series.push({
        name: t('favorites.chartLabels.selectedMolecules', { defaultValue: 'Selected Molecules' }),
        type: 'scatter',
        data: selectedData.map((d) => ({
          value: [d.HOMO_EV_DISPLAY, d.LUMO_EV_DISPLAY],
          label: d.ABBREVIATION,
          molecule: d.molecule,
          smiles: d.SMILES,
        })),
        symbolSize: 10,
        symbol: 'pin',
        itemStyle: {
          color: '#9C27B0',
          opacity: 1.0,
          borderColor: '#000',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: '#9C27B0',
          },
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          color: '#000',
          fontWeight: 500,
          formatter: (params: any) => params.data.label || '',
        },
      });
    }

    return {
      ...CHART_COMMON_CONFIG,
      title: {
        text: t('favorites.chartTitles.mo', { defaultValue: 'MO Analysis' }),
        left: 'center',
        textStyle: CHART_TITLE_STYLE,
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (!params.data) return '';
          const lines = [`<strong>${params.data.label || 'N/A'}</strong><br/>`];
          lines.push(`HOMO: ${params.data.value[0]?.toFixed(3) || 'N/A'} eV`);
          lines.push(`LUMO: ${params.data.value[1]?.toFixed(3) || 'N/A'} eV`);
          if (params.data.smiles) {
            lines.push(`SMILES: ${params.data.smiles}`);
          }
          lines.push(`Type: ${params.data.molecule ? 'Selected' : 'Reference'}`);
          return lines.join('<br/>');
        },
      },
      legend: {
        data: series.map((s) => s.name),
        top: 'top',
        left: 'left',
        textStyle: AXIS_LABEL_STYLE,
        orient: 'vertical',
      },
      xAxis: {
        type: 'value',
        name: t('favorites.chartProperties.homo', { defaultValue: 'HOMO (eV)' }),
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
        name: t('favorites.chartProperties.lumo', { defaultValue: 'LUMO (eV)' }),
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
      series: series,
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
      <div className="mo-chart-empty">
        <p>{t('favorites.noMoleculesSelected', { defaultValue: '请选择至少一个分子进行分析' })}</p>
      </div>
    );
  }

  return (
    <div className="mo-chart-container">
      <EchartsReact option={option} height="800px" width="100%" onEvents={onEvents} />
    </div>
  );
};

export default MOChart;
