import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

interface PropertyItem {
  id: number;
  property: string;
  type: string;
  group?: string;
  estimatedTime?: string;
  groupRowSpan?: number;
  timeRowSpan?: number;
}

interface PropertiesTableProps {
  properties?: PropertyItem[];
}

const PropertiesTable: React.FC<PropertiesTableProps> = ({ properties }) => {
  const { t } = useTranslation();

  const defaultProperties: PropertyItem[] = [
    {
      id: 1,
      property: t('formulation.introductionNew.standardSolvationClusterTableName'),
      type: t('formulation.introductionNew.table.types.structural'),
      group: t('formulation.introductionNew.groupStandardProperties'),
      estimatedTime: t('formulation.introductionNew.table.estimatedTimes.short'),
      groupRowSpan: 5,
      timeRowSpan: 5,
    },
    {
      id: 2,
      property: t('formulation.introductionNew.standardDiffusivityTitle'),
      type: t('formulation.introductionNew.table.types.dynamic'),
    },
    {
      id: 3,
      property: t('formulation.introductionNew.standardConductivityTitle'),
      type: t('formulation.introductionNew.table.types.dynamic'),
    },
    {
      id: 4,
      property: t('formulation.introductionNew.standardViscosityTitle'),
      type: t('formulation.introductionNew.table.types.dynamic'),
    },
    {
      id: 5,
      property: t('formulation.introductionNew.standardDensityTitle'),
      type: t('formulation.introductionNew.table.types.structural'),
    },
    {
      id: 6,
      property: t('formulation.introductionNew.standardRdfTitle'),
      type: t('formulation.introductionNew.table.types.structural'),
      group: t('formulation.introductionNew.groupAdvancedAnalysis'),
      estimatedTime: t('formulation.introductionNew.table.estimatedTimes.medium'),
      groupRowSpan: 6,
      timeRowSpan: 6,
    },
    {
      id: 7,
      property: t('formulation.introductionNew.standardCnTitle'),
      type: t('formulation.introductionNew.table.types.structural'),
    },
    {
      id: 8,
      property: t('formulation.introductionNew.advancedIonCorrelationTitle'),
      type: t('formulation.introductionNew.table.types.dynamic'),
    },
    {
      id: 9,
      property: t('formulation.introductionNew.advancedStructureFactorTitle'),
      type: t('formulation.introductionNew.table.types.structural'),
    },
    {
      id: 10,
      property: t('formulation.introductionNew.advancedDynamicStructureFactorTitle'),
      type: t('formulation.introductionNew.table.types.structuralDynamic'),
    },
    {
      id: 11,
      property: t('formulation.introductionNew.advancedResidenceTimeTitle'),
      type: t('formulation.introductionNew.table.types.dynamic'),
    },
    {
      id: 12,
      property: t('formulation.introductionNew.customEdlTitle'),
      type: t('formulation.introductionNew.table.types.thermodynamic'),
      group: t('formulation.introductionNew.groupCustomStudies'),
      estimatedTime: t('formulation.introductionNew.table.estimatedTimes.long'),
      groupRowSpan: 2,
      timeRowSpan: 2,
    },
    {
      id: 13,
      property: t('formulation.introductionNew.customSolubilityTitle'),
      type: t('formulation.introductionNew.table.types.thermodynamic'),
    },
  ];

  const tableData = properties ?? defaultProperties;

  return (
    <table className="md-properties-table">
      <thead>
        <tr>
          <th>{t('formulation.introductionNew.table.headers.no')}</th>
          <th>{t('formulation.introductionNew.table.headers.property')}</th>
          <th>{t('formulation.introductionNew.table.headers.type')}</th>
          <th>{t('formulation.introductionNew.table.headers.group')}</th>
          <th>{t('formulation.introductionNew.table.headers.estimatedTime')}</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.property}</td>
            <td>{item.type}</td>
            {item.groupRowSpan && (
              <td rowSpan={item.groupRowSpan} className="group-cell">{item.group}</td>
            )}
            {item.timeRowSpan && (
              <td rowSpan={item.timeRowSpan} className="time-cell">{item.estimatedTime}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PropertiesTable;