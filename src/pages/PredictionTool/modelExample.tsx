// Mock data configuration for model training
import { ModelListItem, ModelDetailResponse } from '@/services/model/training';

/**
 * Extended ModelListItem with mock flag
 */
export interface MockModelItem extends ModelListItem {
  isMock?: boolean;
}

/**
 * Mock model list data
 * Used when user is not logged in or when there's no real data
 */
export const mockModelList: MockModelItem[] = [
  {
    id: 999901,
    isMock: true,
    model_name: 'Li-ion Cycle Predictor v2.1',
    base_model_name: 'OSES-Base-v1',
    status: 'online',
    created_at: '2024-01-10T08:00:00Z',
    created_by: 'Dr. Zhang Wei',
    updated_at: '2024-01-15T10:30:00Z',
    updated_by: 'Dr. Zhang Wei',
  },
];

/**
 * Mock model detail data
 * Provides complete model information for demonstration
 */
export const mockModelDetail: ModelDetailResponse = {
  id: '999901',
  model_name: 'Li-ion Cycle Predictor v2.1',
  status: 'online',
  remark: 'This model is optimized for Li-ion batteries with high energy density. It uses advanced deep learning techniques to predict cycle life with high accuracy.',
  created_at: '2024-01-10T08:00:00Z',
  base_model_name: 'OSES-Base-v1',
  train_result: {
    accuracy: '96.8%',
    loss: '0.032',
    epochs: 150,
    training_time: '2h 45m',
    validation_score: '95.5%',
  },
  prediction_result: [
    {
      id: '8888',
      file_name: 'demo.csv',
      battery_count: 2806,
      avg_cycle_life: 851,
      created_at: '2024-03-15T10:30:00Z',
    },
    {
      id: '8887',
      file_name: 'battery_test_02.csv',
      battery_count: 1520,
      avg_cycle_life: 923,
      created_at: '2024-03-10T06:22:00Z',
    },
    {
      id: '8883',
      file_name: 'mixed_batch.csv',
      battery_count: 3567,
      avg_cycle_life: 895,
      created_at: '2024-02-25T05:20:00Z',
    },
  ],
};
