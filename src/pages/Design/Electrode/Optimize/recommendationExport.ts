import type { TFunction } from 'i18next';
import {
  TREND_FIELD_KEYS,
  getTrendFieldLabel,
  type RecommendationTrendDatum,
} from './recommendationData';

export type ExportType = 'csv';

interface DownloadRecommendationDataParams {
  type: ExportType;
  data: RecommendationTrendDatum[];
  t: TFunction;
}

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
  data: RecommendationTrendDatum[],
  t: TFunction,
): void => {
  const headers = TREND_FIELD_KEYS.map((key) => getTrendFieldLabel(t, key));

  const lines = data.map((item) =>
    TREND_FIELD_KEYS.map((key) => escapeCsvValue(item[key])).join(','),
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
