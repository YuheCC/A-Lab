// Mock data configuration for Design model training
import { ModelListItem, ModelDetailResponse } from '@/services/model/training';

/**
 * Extended ModelListItem with mock flag
 */
export interface MockModelItem extends ModelListItem {
  isMock?: boolean;
}

/**
 * Mock model list data for Design page
 * Used when user is not logged in or when there's no real data
 */
export const mockModelList: MockModelItem[] = [
  {
    id: 999801,
    isMock: true,
    model_name: 'NCM811-12%Si/graphite-Carbonate electrolyte',
    base_model_name: 'OSES-Design-v1',
    status: 'online',
    created_at: '2024-01-15T08:00:00Z',
    created_by: 'Dr. Li Ming',
    updated_at: '2024-01-20T10:30:00Z',
    updated_by: 'Dr. Li Ming',
  },
];

/**
 * Mock model detail data for Design page
 * Provides complete model information for demonstration
 */
export const mockModelDetail: ModelDetailResponse = {
  id: '999801',
  model_name: 'Electrolyte Design Model v1.0',
  status: 'online',
  remark: 'This model is optimized for electrolyte design prediction. It uses advanced machine learning techniques to predict battery performance based on molecular structure.',
  created_at: '2024-01-15T08:00:00Z',
  base_model_name: 'OSES-Design-v1',
  train_result: {
    accuracy: '94.2%',
    loss: '0.045',
    epochs: 120,
    training_time: '1h 30m',
    validation_score: '93.8%',
  },
  prediction_result: [
    {
      id: '7771',
      file_name: 'design_demo.csv',
      battery_count: 0,
      avg_cycle_life: 0,
      created_at: '2024-03-20T10:30:00Z',
      smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
      temp25_count: 15,
      temp45_count: 12,
    },
    {
      id: '7770',
      file_name: 'design_demo_02.csv',
      battery_count: 0,
      avg_cycle_life: 0,
      created_at: '2024-03-18T14:45:00Z',
      smiles: 'CCO[P](=O)(OCC)OCC',
      temp25_count: 8,
      temp45_count: 6,
    },
  ],
};
