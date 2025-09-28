/**
 * 认证相关的辅助函数
 * 这些函数可以在Zustand store中使用，避免直接使用React hooks
 */

// 全局的登录浮层处理函数
let globalOpenLoginModal: ((redirectPath?: string) => void) | null = null;

/**
 * 设置全局的登录浮层处理函数
 * 在LoginModalProvider中调用
 */
export const setGlobalLoginModalHandler = (handler: (redirectPath?: string) => void) => {
  globalOpenLoginModal = handler;
};

/**
 * 触发全局登录浮层
 * 在需要认证时调用
 */
export const triggerLoginModal = (redirectPath?: string) => {
  if (globalOpenLoginModal) {
    globalOpenLoginModal(redirectPath);
  } else {
    // 降级到传统的页面跳转
    const current = redirectPath || window.location.pathname + window.location.search;
    window.location.href = '/login?redirect=' + encodeURIComponent(current);
  }
};

/**
 * 检查当前路径是否需要弹出登录浮层
 */
export const shouldShowLoginModal = (pathname: string): boolean => {
  return pathname !== '/login' && pathname !== '/';
};
