// Mock 数据 - Optimize 页面
import { DesignRecommendation, DesignDetails } from './types';

// Mock 推荐数据（8 条）
export const mockRecommendations: DesignRecommendation[] = [
  {
    rank: 1,
    designCapacity: 85,
    specificEnergy: 280,
    thickness: 5.2,
    volumetricEnergyDensity: 720,
    id: 'rec-1',
  },
  {
    rank: 2,
    designCapacity: 75,
    specificEnergy: 260,
    thickness: 5.5,
    volumetricEnergyDensity: 680,
    id: 'rec-2',
  },
  {
    rank: 3,
    designCapacity: 90,
    specificEnergy: 295,
    thickness: 4.9,
    volumetricEnergyDensity: 750,
    id: 'rec-3',
  },
  {
    rank: 4,
    designCapacity: 80,
    specificEnergy: 270,
    thickness: 5.3,
    volumetricEnergyDensity: 695,
    id: 'rec-4',
  },
  {
    rank: 5,
    designCapacity: 82,
    specificEnergy: 275,
    thickness: 5.1,
    volumetricEnergyDensity: 710,
    id: 'rec-5',
  },
  {
    rank: 6,
    designCapacity: 72,
    specificEnergy: 255,
    thickness: 5.6,
    volumetricEnergyDensity: 665,
    id: 'rec-6',
  },
  {
    rank: 7,
    designCapacity: 88,
    specificEnergy: 290,
    thickness: 5.0,
    volumetricEnergyDensity: 740,
    id: 'rec-7',
  },
  {
    rank: 8,
    designCapacity: 84,
    specificEnergy: 278,
    thickness: 5.2,
    volumetricEnergyDensity: 705,
    id: 'rec-8',
  },
  {
    rank: 9,
    designCapacity: 87,
    specificEnergy: 285,
    thickness: 5.1,
    volumetricEnergyDensity: 725,
    id: 'rec-9',
  },
  {
    rank: 10,
    designCapacity: 70,
    specificEnergy: 250,
    thickness: 5.7,
    volumetricEnergyDensity: 670,
    id: 'rec-10',
  },
];

// 生成 Mock 详情数据的函数
export const generateMockDetail = (id: string): DesignDetails => {
  const recommendation = mockRecommendations.find((rec) => rec.id === id);
  const rank = recommendation?.rank || 1;

  // 根据不同的 rank 生成不同的详情数据
  const detailsMap: Record<number, DesignDetails> = {
    1: {
      rank: 1,
      // Performance Prediction
      designCapacity: 85,
      gravimetricEnergyDensity: 280,
      thickness: 5.2,
      volumetricEnergy: 720,
      // Design
      cellDesign: 'Balanced',
      cathodeActiveMaterial: 'NCM811',
      anodeActiveMaterial: '12% Si',
      width: 150,
      length: 200,
      layers: 12,
      npRatio: '1.07',
      cathodeParameters: {
        binder1: '1.5', // PVDF
        binder2: '1', // CNT
        conductiveCarbon: '1.5', // Carbon black
        activeMaterial: '96', // Active material
        arealLoading: '4', // mAh/cm²
        pressDensity: '3.4', // g/cc
      },
      anodeParameters: {
        binder1: '1.5', // CMC
        binder2: '1.5', // SBR
        binder3: '1.5', // PAA
        conductiveCarbon1: '1', // Carbon black
        conductiveCarbon2: '0.6', // CNT
        activeMaterial1: '12', // SiC
        activeMaterial2: '88', // Graphite
        arealLoading: '3.74', // mAh/cm²
        pressDensity: '1.4', // g/cc
      },
    },
    2: {
      rank: 2,
      designCapacity: 75,
      gravimetricEnergyDensity: 260,
      thickness: 5.5,
      volumetricEnergy: 680,
      cellDesign: 'Power',
      cathodeActiveMaterial: 'NCM622',
      anodeActiveMaterial: 'Graphite',
      width: 145,
      length: 195,
      layers: 11,
      npRatio: '1.10',
      cathodeParameters: {
        binder1: '1.2',
        binder2: '0.8',
        conductiveCarbon: '1.8',
        activeMaterial: '94',
        arealLoading: '3.5',
        pressDensity: '3.2',
      },
      anodeParameters: {
        binder1: '1.3',
        binder2: '1.2',
        binder3: '1.0',
        conductiveCarbon1: '1.2',
        conductiveCarbon2: '0.5',
        activeMaterial1: '10',
        activeMaterial2: '90',
        arealLoading: '3.2',
        pressDensity: '1.5',
      },
    },
    3: {
      rank: 3,
      designCapacity: 90,
      gravimetricEnergyDensity: 295,
      thickness: 4.9,
      volumetricEnergy: 750,
      cellDesign: 'Energy',
      cathodeActiveMaterial: 'NCM811',
      anodeActiveMaterial: '15% Si',
      width: 155,
      length: 205,
      layers: 13,
      npRatio: '1.05',
      cathodeParameters: {
        binder1: '1.6',
        binder2: '1.2',
        conductiveCarbon: '1.4',
        activeMaterial: '97',
        arealLoading: '4.2',
        pressDensity: '3.5',
      },
      anodeParameters: {
        binder1: '1.6',
        binder2: '1.6',
        binder3: '1.8',
        conductiveCarbon1: '0.8',
        conductiveCarbon2: '0.7',
        activeMaterial1: '15',
        activeMaterial2: '85',
        arealLoading: '4.0',
        pressDensity: '1.3',
      },
    },
  };

  // 如果 rank 不在预定义的范围内，使用默认数据
  const defaultDetail: DesignDetails = {
    rank,
    designCapacity: recommendation?.designCapacity || 85,
    gravimetricEnergyDensity: recommendation?.specificEnergy || 280,
    thickness: recommendation?.thickness || 5.2,
    volumetricEnergy: recommendation?.volumetricEnergyDensity || 720,
    cellDesign: 'Balanced',
    cathodeActiveMaterial: 'NCM811',
    anodeActiveMaterial: '12% Si',
    width: 150,
    length: 200,
    layers: 12,
    npRatio: '1.07',
    cathodeParameters: {
      binder1: '1.5',
      binder2: '1',
      conductiveCarbon: '1.5',
      activeMaterial: '96',
      arealLoading: '4',
      pressDensity: '3.4',
    },
    anodeParameters: {
      binder1: '1.5',
      binder2: '1.5',
      binder3: '1.5',
      conductiveCarbon1: '1',
      conductiveCarbon2: '0.6',
      activeMaterial1: '12',
      activeMaterial2: '88',
      arealLoading: '3.74',
      pressDensity: '1.4',
    },
  };

  return detailsMap[rank] || defaultDetail;
};
