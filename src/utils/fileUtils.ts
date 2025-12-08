/**
 * 文件工具函数
 */

/**
 * 格式化文件大小,自动选择合适的单位 (B, KB, MB, GB)
 * @param bytes 文件大小(字节)
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  } else {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }
};
