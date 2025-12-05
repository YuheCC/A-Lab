import request from "@/services/request";

// ============= Train Model Types =============

/**
 * Train model request parameters
 */
export interface TrainModelParams {
  model_name: string;
  remark: string;
  base_model_name?: string;
  base_model_id?: number;
  data_files: File | File[];
  namespace: string;
  train_params?: string; // JSON stringified object containing cathode, anode, benchmarkElectrolyte, cellDesign
}

/**
 * Train model response
 */
export interface TrainModelResponse {
  id: string;
}

// ============= Model List Types =============

/**
 * Model list request parameters
 */
export interface ModelListParams {
  page?: number;
  page_size?: number;
  namespace: string;
  base_model_id?: number;
  keyword?: string;
  status?: string;
  base_model_name?: string;
}

/**
 * Model list item
 */
export interface ModelListItem {
  id: number;
  model_name: string;
  base_model_name: string;
  base_model_id?: number;
  model_type?: number; // 1: ratePerformance, 2: ce, 3: cycleLife
  status: 'training' | 'trained' | 'online';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  train_params?: string; // JSON stringified object containing cathode, anode, benchmarkElectrolyte, cellDesign
}

/**
 * Model list response
 */
export interface ModelListResponse {
  total: number;
  data: ModelListItem[];
}

// ============= Model Detail Types =============

/**
 * Model detail request parameters
 */
export interface ModelDetailParams {
  model_id: string;
  namespace?: string;
}

/**
 * Training result
 */
export interface TrainResult {
  accuracy?: string;
  loss?: string;
  epochs?: number;
  training_time?: string;
  validation_score?: string;
  [key: string]: any;
}

/**
 * Prediction record
 */
export interface PredictionRecord {
  id?: string;
  file_name?: string;
  battery_count?: number;
  avg_cycle_life?: number;
  created_at?: string;
  [key: string]: any;
}

/**
 * Model detail response
 */
export interface ModelDetailResponse {
  id: string;
  model_name: string;
  status: string;
  remark: string;
  created_at: string;
  base_model_name: string;
  base_model_id: number;
  created_by: string;
  created_by_name: string;
  updated_at: string;
  updated_by: string;
  updated_by_name: string;
  train_result: TrainResult;
  prediction_result: PredictionRecord[];
}

// ============= Deploy Model Types =============

/**
 * Deploy model request parameters
 */
export interface DeployModelParams {
  model_id: string;
  namespace: string;
}

/**
 * Deploy model response
 */
export interface DeployModelResponse {
  success?: boolean;
  [key: string]: any;
}

// ============= Undeploy Model Types =============

/**
 * Undeploy model request parameters
 */
export interface UndeployModelParams {
  model_id: string;
  namespace: string;
}

/**
 * Undeploy model response
 */
export interface UndeployModelResponse {
  success?: boolean;
  [key: string]: any;
}

// ============= Remove Model Types =============

/**
 * Remove model request parameters
 */
export interface RemoveModelParams {
  model_id: string;
}

/**
 * Remove model response
 */
export interface RemoveModelResponse {
  success?: boolean;
  [key: string]: any;
}

// ============= Model Prediction Types =============

/**
 * Model prediction request parameters
 */
export interface ModelPredictParams {
  data_files: File;
  model_id: string;
  namespace: string;
}

/**
 * Model prediction response
 */
export interface ModelPredictResponse {
  [key: string]: any;
}

// ============= API Functions =============

/**
 * Train a new model
 * @param params Training parameters including model name, remark, base model, data files, and namespace
 * @returns Promise<TrainModelResponse> Training response with model ID
 */
export const trainModel = async (params: TrainModelParams): Promise<TrainModelResponse> => {
  const formData = new FormData();
  formData.append('model_name', params.model_name);
  formData.append('remark', params.remark);
  if (params.base_model_name) {
    formData.append('base_model_name', params.base_model_name as string);
  }
  if (params.base_model_id) {
    formData.append('base_model_id', params.base_model_id.toString());
  }
  // Support single file or multiple files
  if (Array.isArray(params.data_files)) {
    params.data_files.forEach((file) => {
      formData.append('data_files', file);
    });
  } else {
    formData.append('data_files', params.data_files);
  }
  formData.append('namespace', params.namespace);

  // Add train_params if provided
  if (params.train_params) {
    formData.append('train_params', params.train_params);
  }

  const response = await request('/api/ai/model/train', {
    method: 'POST',
    data: formData,
    // Don't set Content-Type, request.ts will handle it automatically
  });

  return response.data;
};

/**
 * Get model list
 * @param params Query parameters including page, page_size, namespace, base_model_id, keyword, status, and base_model_name
 * @returns Promise<ModelListResponse> Model list with pagination
 */
export const getModelList = async (params: ModelListParams): Promise<ModelListResponse> => {
  const response = await request('/api/ai/model/list', {
    method: 'GET',
    params: {
      page: params.page,
      page_size: params.page_size,
      namespace: params.namespace,
      base_model_id: params.base_model_id,
      keyword: params.keyword,
      status: params.status,
      base_model_name: params.base_model_name,
    },
  });

  return response.data;
};

/**
 * Get model detail by ID
 * @param params Query parameters including model_id and optional namespace
 * @returns Promise<ModelDetailResponse> Model detail information
 */
export const getModelDetail = async (params: ModelDetailParams): Promise<ModelDetailResponse> => {
  const response = await request('/api/ai/model/detail', {
    method: 'GET',
    params: {
      model_id: params.model_id,
      namespace: params.namespace,
    },
  });

  return response.data;
};

/**
 * Deploy model (make it online)
 * @param params Deploy parameters including model_id and namespace
 * @returns Promise<DeployModelResponse> Deploy result
 */
export const deployModel = async (params: DeployModelParams): Promise<DeployModelResponse> => {
  const response = await request('/api/ai/model/deploy', {
    method: 'POST',
    params: {
      model_id: params.model_id,
      namespace: params.namespace,
    },
  });

  return response.data;
};

/**
 * Undeploy model (make it offline)
 * @param params Undeploy parameters including model_id and namespace
 * @returns Promise<UndeployModelResponse> Undeploy result
 */
export const undeployModel = async (params: UndeployModelParams): Promise<UndeployModelResponse> => {
  const response = await request('/api/ai/model/undeploy', {
    method: 'POST',
    params: {
      model_id: params.model_id,
      namespace: params.namespace,
    },
  });

  return response.data;
};

/**
 * Remove/delete a model
 * @param params Remove parameters with model_id
 * @returns Promise<RemoveModelResponse> Remove result
 */
export const removeModel = async (params: RemoveModelParams): Promise<RemoveModelResponse> => {
  const response = await request('/api/ai/model/remove', {
    method: 'POST',
    params: {
      model_id: params.model_id,
    },
  });

  return response.data;
};

/**
 * Run model prediction
 * @param params Prediction parameters including data_files, model_id, and namespace
 * @returns Promise<ModelPredictResponse[]> Prediction results array
 */
export const modelPredict = async (params: ModelPredictParams): Promise<ModelPredictResponse[]> => {
  const formData = new FormData();
  formData.append('data_files', params.data_files);
  formData.append('model_id', params.model_id);
  formData.append('namespace', params.namespace);

  const response = await request('/api/ai/model/predict', {
    method: 'POST',
    data: formData,
    // Don't set Content-Type, request.ts will handle it automatically
  });

  return response.data;
};
