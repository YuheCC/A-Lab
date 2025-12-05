import request from "@/services/request";

export interface FileUploadResponse {
    success: boolean;
    message?: string;
    data?: {
        filename: string;
        size: number;
        path?: string;
        url?: string;
    };
}

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @param onProgress 上传进度回调函数
 * @returns Promise<FileUploadResponse>
 */
export async function uploadFile(
    file: File, 
    onProgress?: (progressEvent: { loaded: number; total: number; percent: number }) => void
): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await request('/api/user/files/upload', {
            method: "POST",
            data: formData,
            onUploadProgress: (progressEvent: any) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percent
                    });
                }
            }
        });
        
        return {
            success: true,
            data: response.data,
            message: '文件上传成功'
        };
    } catch (error: any) {
        console.error('File upload error:', error);
        return {
            success: false,
            message: error.message || '文件上传失败'
        };
    }
}

/**
 * 验证文件类型和大小
 * @param file 要验证的文件
 * @param maxSizeMB 最大文件大小（MB）
 * @param allowedTypes 允许的文件类型
 */
export function validateFile(
    file: File, 
    maxSizeMB: number = 5, 
    allowedTypes: string[] = ['image/jpeg', 'image/png']
): { valid: boolean; error?: string } {
    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `不支持的文件类型。只允许: ${allowedTypes.join(', ')}`
        };
    }

    // 检查文件大小
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `文件太大。最大允许 ${maxSizeMB}MB`
        };
    }

    return { valid: true };
}
