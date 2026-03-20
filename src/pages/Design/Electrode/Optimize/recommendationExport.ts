import type { TFunction } from 'i18next';
import type { BackwardResultItemDTO } from '@/services/electrode/types';

export type ExportType = 'csv';

interface DownloadRecommendationDataParams {
  type: ExportType;
  data: BackwardResultItemDTO[];
  t: TFunction;
}

type ExportFieldKey = keyof Omit<BackwardResultItemDTO, 'id'>;

const EXPORT_FIELD_KEYS: ExportFieldKey[] = [
  'item_id',
  'design_capacity',
  'specific_ED',
  'jelly_roll_thickness',
  'volumetric_ED',
  'Cap_1C',
  'Cap_2C',
  'Cap_3C',
  'Cap_4C',
  'Cap_5C',
  'T_1C',
  'T_2C',
  'T_3C',
  'T_4C',
  'T_5C',
  'cathode_binder_wt',
  'cathode_cnt_wt',
  'cathode_conductive_carbon_wt',
  'cathode_areal_loading',
  'cathode_press_density',
  'anode_binder1_wt',
  'anode_binder2_wt',
  'anode_binder3_wt',
  'anode_conductive_carbon_wt',
  'anode_cnt_wt',
  'anode_press_density',
  'layers',
  'np_ratio',
  'si_ratio',
];

const getExportFieldLabel = (t: TFunction, key: ExportFieldKey): string => {
  const capacityRetentionLabel = t('design.electrode.predict.capacityRetention', 'Capacity Retention');
  const temperatureLabel = t('design.electrode.predict.temperature', 'Temperature');

  switch (key) {
    case 'item_id':
      return t('design.electrode.optimize.no', 'No.');
    case 'design_capacity':
      return `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`;
    case 'specific_ED':
      return `${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`;
    case 'jelly_roll_thickness':
      return `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`;
    case 'volumetric_ED':
      return `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`;
    case 'Cap_1C':
      return `${capacityRetentionLabel} @1C (%)`;
    case 'Cap_2C':
      return `${capacityRetentionLabel} @2C (%)`;
    case 'Cap_3C':
      return `${capacityRetentionLabel} @3C (%)`;
    case 'Cap_4C':
      return `${capacityRetentionLabel} @4C (%)`;
    case 'Cap_5C':
      return `${capacityRetentionLabel} @5C (%)`;
    case 'T_1C':
      return `${temperatureLabel} @1C (°C)`;
    case 'T_2C':
      return `${temperatureLabel} @2C (°C)`;
    case 'T_3C':
      return `${temperatureLabel} @3C (°C)`;
    case 'T_4C':
      return `${temperatureLabel} @4C (°C)`;
    case 'T_5C':
      return `${temperatureLabel} @5C (°C)`;
    case 'cathode_binder_wt':
      return 'PVDF (wt.%)';
    case 'cathode_cnt_wt':
      return 'Cathode CNT (wt.%)';
    case 'cathode_conductive_carbon_wt':
      return 'Cathode Carbon black (wt.%)';
    case 'cathode_areal_loading':
      return 'Cathode Areal Loading (mAh/cm²)';
    case 'cathode_press_density':
      return 'Cathode Press Density (g/cc)';
    case 'anode_binder1_wt':
      return 'CMC (wt.%)';
    case 'anode_binder2_wt':
      return 'SBR (wt.%)';
    case 'anode_binder3_wt':
      return 'PAA (wt.%)';
    case 'anode_conductive_carbon_wt':
      return 'Anode Carbon black (wt.%)';
    case 'anode_cnt_wt':
      return 'Anode CNT (wt.%)';
    case 'anode_press_density':
      return 'Anode Press Density (g/cc)';
    case 'layers':
      return t('design.electrode.predict.layers', 'Layers');
    case 'np_ratio':
      return t('design.electrode.predict.npRatio', 'NP Ratio');
    case 'si_ratio':
      return t('design.electrode.predict.siRatio', 'Si Ratio');
    default:
      return String(key);
  }
};

const getExportFieldValue = (
  item: BackwardResultItemDTO,
  key: ExportFieldKey,
): string | number | null | undefined => {
  if (key === 'si_ratio') {
    return item.si_ratio ?? (item as any).siratio;
  }
  return item[key];
};

const escapeCsvValue = (value: string | number | null | undefined): string => {
  const normalized = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
};

const buildTimestamp = (): string => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

export const downloadRecommendationCsv = (
  data: BackwardResultItemDTO[],
  t: TFunction,
): void => {
  const headers = EXPORT_FIELD_KEYS.map((key) => getExportFieldLabel(t, key));

  const lines = data.map((item) =>
    EXPORT_FIELD_KEYS.map((key) => escapeCsvValue(getExportFieldValue(item, key))).join(','),
  );

  const csvContent = [headers.map(escapeCsvValue).join(','), ...lines].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inverse_design_recommendations_${buildTimestamp()}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadRecommendationData = ({
  type,
  data,
  t,
}: DownloadRecommendationDataParams): void => {
  if (type === 'csv') {
    downloadRecommendationCsv(data, t);
  }
};
