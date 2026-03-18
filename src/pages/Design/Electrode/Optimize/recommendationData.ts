import type { TFunction } from 'i18next';
import type { BackwardResultItemDTO } from '@/services/electrode/types';

export type TrendChartFieldKey =
  | 'no'
  | 'designCapacity'
  | 'specificEnergy'
  | 'thickness'
  | 'volumetricEnergyDensity'
  | 'cathodeBinderWt'
  | 'cathodeCntWt'
  | 'cathodeConductiveCarbonWt'
  | 'cathodeArealLoading'
  | 'cathodePressDensity'
  | 'anodeBinder1Wt'
  | 'anodeBinder2Wt'
  | 'anodeBinder3Wt'
  | 'anodeConductiveCarbonWt'
  | 'anodeCntWt'
  | 'anodePressDensity';

export interface RecommendationTrendDatum {
  no: number;
  designCapacity: number;
  specificEnergy: number;
  thickness: number;
  volumetricEnergyDensity: number;
  cathodeBinderWt: number;
  cathodeCntWt: number;
  cathodeConductiveCarbonWt: number;
  cathodeArealLoading: number;
  cathodePressDensity: number;
  anodeBinder1Wt: number;
  anodeBinder2Wt: number;
  anodeBinder3Wt: number;
  anodeConductiveCarbonWt: number;
  anodeCntWt: number;
  anodePressDensity: number;
}

export const TREND_FIELD_KEYS: TrendChartFieldKey[] = [
  'no',
  'designCapacity',
  'specificEnergy',
  'thickness',
  'volumetricEnergyDensity',
  'cathodeBinderWt',
  'cathodeCntWt',
  'cathodeConductiveCarbonWt',
  'cathodeArealLoading',
  'cathodePressDensity',
  'anodeBinder1Wt',
  'anodeBinder2Wt',
  'anodeBinder3Wt',
  'anodeConductiveCarbonWt',
  'anodeCntWt',
  'anodePressDensity',
];

export const TREND_FIELD_META: Record<TrendChartFieldKey, { unit: string; color: string }> = {
  no: { unit: '', color: '#6b7280' },
  designCapacity: { unit: 'Ah', color: '#8b5cf6' },
  specificEnergy: { unit: 'Wh/kg', color: '#56B26A' },
  thickness: { unit: 'mm', color: '#3b82f6' },
  volumetricEnergyDensity: { unit: 'Wh/L', color: '#f59e0b' },
  cathodeBinderWt: { unit: 'wt.%', color: '#10b981' },
  cathodeCntWt: { unit: 'wt.%', color: '#14b8a6' },
  cathodeConductiveCarbonWt: { unit: 'wt.%', color: '#06b6d4' },
  cathodeArealLoading: { unit: 'mAh/cm²', color: '#0ea5e9' },
  cathodePressDensity: { unit: 'g/cc', color: '#0284c7' },
  anodeBinder1Wt: { unit: 'wt.%', color: '#84cc16' },
  anodeBinder2Wt: { unit: 'wt.%', color: '#65a30d' },
  anodeBinder3Wt: { unit: 'wt.%', color: '#a3e635' },
  anodeConductiveCarbonWt: { unit: 'wt.%', color: '#f97316' },
  anodeCntWt: { unit: 'wt.%', color: '#ea580c' },
  anodePressDensity: { unit: 'g/cc', color: '#fb7185' },
};

export const isTrendField = (value?: string): value is TrendChartFieldKey =>
  !!value && TREND_FIELD_KEYS.includes(value as TrendChartFieldKey);

export const getTrendFieldLabel = (t: TFunction, key: TrendChartFieldKey): string => {
  if (key === 'no') {
    return t('design.electrode.optimize.no', 'No.');
  }
  if (key === 'designCapacity') {
    return `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`;
  }
  if (key === 'specificEnergy') {
    return `${t('design.electrode.optimize.specificEnergy', 'Gravimetric Energy Density')} (Wh/kg)`;
  }
  if (key === 'thickness') {
    return `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`;
  }
  if (key === 'volumetricEnergyDensity') {
    return `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric Energy Density')} (Wh/L)`;
  }
  if (key === 'cathodeBinderWt') {
    return 'PVDF (wt.%)';
  }
  if (key === 'cathodeCntWt') {
    return 'Cathode CNT (wt.%)';
  }
  if (key === 'cathodeConductiveCarbonWt') {
    return 'Cathode Carbon black (wt.%)';
  }
  if (key === 'cathodeArealLoading') {
    return 'Cathode Areal Loading (mAh/cm²)';
  }
  if (key === 'cathodePressDensity') {
    return 'Cathode Press Density (g/cc)';
  }
  if (key === 'anodeBinder1Wt') {
    return 'CMC (wt.%)';
  }
  if (key === 'anodeBinder2Wt') {
    return 'SBR (wt.%)';
  }
  if (key === 'anodeBinder3Wt') {
    return 'PAA (wt.%)';
  }
  if (key === 'anodeConductiveCarbonWt') {
    return 'Anode Carbon black (wt.%)';
  }
  if (key === 'anodeCntWt') {
    return 'Anode CNT (wt.%)';
  }
  return 'Anode Press Density (g/cc)';
};

export const mapBackwardResultsToTrendData = (
  items: BackwardResultItemDTO[],
): RecommendationTrendDatum[] =>
  items.map((item, index) => ({
    no: index + 1,
    designCapacity: item.design_capacity,
    specificEnergy: item.specific_ED,
    thickness: item.jelly_roll_thickness,
    volumetricEnergyDensity: item.volumetric_ED,
    cathodeBinderWt: item.cathode_binder_wt,
    cathodeCntWt: item.cathode_cnt_wt,
    cathodeConductiveCarbonWt: item.cathode_conductive_carbon_wt,
    cathodeArealLoading: item.cathode_areal_loading,
    cathodePressDensity: item.cathode_press_density,
    anodeBinder1Wt: item.anode_binder1_wt,
    anodeBinder2Wt: item.anode_binder2_wt,
    anodeBinder3Wt: item.anode_binder3_wt,
    anodeConductiveCarbonWt: item.anode_conductive_carbon_wt,
    anodeCntWt: item.anode_cnt_wt,
    anodePressDensity: item.anode_press_density,
  }));
