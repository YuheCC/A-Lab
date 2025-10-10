import request from "@/services/request";

// 预测接口返回数据类型定义
export interface PredictResponse {
  id: number;
  file_name: string;
  file_path: string;
  barcode_count: number;
  avg_cycle_life_1: number | null;
  avg_cycle_life_2: number | null;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// 预测接口参数类型定义
export interface PredictParams {
  file: File;
}

// 历史记录列表接口参数类型
export interface HistoryListParams {
  page?: number;
  page_size?: number;
}

// 历史记录列表响应数据类型
export interface HistoryListResponse {
  total: number;
  data: PredictResponse[];
}

// 条形码数据类型
export interface BarcodeData {
  id: number;
  barcode: string;
  cycle_life_1: number | null;
  cycle_life_2: number | null;
  cycle_life_1_cycles_detail?: Record<string, number>;
  cycle_life_1_predict_detail?: any;
  history_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// 历史记录详情响应数据类型
export interface HistoryDetailResponse extends PredictResponse {
  brcode_data: BarcodeData[];
  fail_reason_1?: string;
  fail_reason_2?: string;
}

// 删除历史记录参数类型
export interface DeleteHistoryParams {
  id: number;
}

// 删除历史记录响应类型
export interface DeleteHistoryResponse {
  success: boolean;
}

// 文件下载参数类型
export interface FileDownloadParams {
  filename: string;
}

/**
 * 细胞生命周期预测接口（异步，带轮询）
 * @param params 包含上传文件的参数
 * @returns Promise<HistoryDetailResponse> 预测结果（包含详细数据）
 */
export const predict = async (params: PredictParams): Promise<HistoryDetailResponse> => {
  const formData = new FormData();
  formData.append('file', params.file);

  // 1. 调用预测接口，获取任务ID
  const response = await request('/api/cellLife/model_predict', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const taskId = response?.data?.id;

  if (!taskId && (response.status !== 401 && response.status !== 402)) {
    throw new Error('预测任务创建失败，未返回任务ID');
  }

  // 2. 轮询获取结果
  return pollPredictionResult(taskId);
};

/**
 * 轮询预测结果
 * @param taskId 任务ID
 * @returns Promise<HistoryDetailResponse> 最终预测结果
 */
const pollPredictionResult = async (taskId: number): Promise<HistoryDetailResponse> => {
  const maxRetries = 60; // 最大重试次数（10分钟，每10秒一次）
  const pollInterval = 10000; // 轮询间隔：10秒

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 获取任务详情
      const result = await getHistoryDetail(taskId);
      
      // 检查任务状态
      if (result.status !== 'running') {
        // 任务完成（成功或失败）
        return result;
      }
      
      // 任务仍在运行，等待后继续轮询
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
      
    } catch (error) {
      // 如果是最后一次重试，抛出错误
      if (attempt === maxRetries - 1) {
        throw new Error('获取预测结果失败: ' + (error as Error).message);
      }
      
      // 否则等待后重试
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  // 超时
  throw new Error('预测超时，请稍后查看历史记录');
};

/**
 * 获取预测历史记录列表
 * @param params 分页参数
 * @returns Promise<HistoryListResponse> 历史记录列表
 */
export const getHistoryList = async (params: HistoryListParams = {}): Promise<HistoryListResponse> => {
  const { page = 1, page_size = 2 } = params;
  
  const response = await request('/api/cellLife/history/list', {
    method: 'GET',
    params: {
      page,
      page_size,
    },
  });

  return response.data;
};

/**
 * 获取预测历史记录详情
 * @param id 历史记录ID
 * @returns Promise<HistoryDetailResponse> 历史记录详情
 */
export const getHistoryDetail = async (id: number): Promise<HistoryDetailResponse> => {
  const response = await request('/api/cellLife/history/detail', {
    method: 'GET',
    params: {
      id,
    },
  });

  return response.data;
};

/**
 * 删除预测历史记录
 * @param params 包含要删除的记录ID
 * @returns Promise<DeleteHistoryResponse> 删除结果
 */
export const deleteHistory = async (params: DeleteHistoryParams): Promise<DeleteHistoryResponse> => {
  const response = await request('/api/cellLife/history/delete', {
    method: 'POST',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

/**
 * 通过文件名下载文件内容
 * @param params 包含文件名的参数
 * @returns Promise<Blob> 文件内容
 */
export const downloadFile = async (params: FileDownloadParams): Promise<Blob> => {
  const response = await request('/api/file/get', {
    method: 'GET',
    params: {
      filename: params.filename,
    },
    responseType: 'blob',
  });

  return response.data;
};

/**
 * 通过文件名获取文件下载URL
 * @param filename 文件名
 * @returns string 下载URL
 */
export const getFileDownloadUrl = (filename: string): string => {
  const baseURL = process.env.NODE_ENV === 'development' 
    ? 'http://127.0.0.1:8008' 
    : 'https://prod-api.ses.ai';
  return `${baseURL}/api/file/get?filename=${encodeURIComponent(filename)}`;
};
