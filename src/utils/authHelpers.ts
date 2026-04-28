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
 * 重置全局的登录浮层处理函数
 * 在LoginModalProvider清理时调用
 */
export const resetGlobalLoginModalHandler = () => {
  globalOpenLoginModal = null;
};

/**
 * 触发全局登录浮层
 * 在需要认证时调用
 */
export const triggerLoginModal = (redirectPath?: string) => {
  if (globalOpenLoginModal) {
    globalOpenLoginModal(redirectPath);
  } else {
    // 等待一小段时间让LoginModalProvider初始化完成
    // 避免在页面刷新时立即跳转到登录页面
    const waitForModalHandler = (retryCount = 0) => {
      if (globalOpenLoginModal) {
        globalOpenLoginModal(redirectPath);
      } else if (retryCount < 5) {
        // 等待50ms后重试，最多重试5次
        setTimeout(() => waitForModalHandler(retryCount + 1), 50);
      } else {
        // 超过重试次数后才降级到传统的页面跳转
        console.warn('LoginModalProvider未能及时初始化，降级到页面跳转');
        const current = redirectPath || window.location.pathname + window.location.search;
        window.location.href = '/login?redirect=' + encodeURIComponent(current);
      }
    };

    waitForModalHandler();
  }
};

// 全局的 pricing 浮层处理函数
let globalOpenPricingModal: ((permission?: string | null) => void) | null = null;

/**
 * 设置全局的 pricing 浮层处理函数
 * 在 PricingContext Provider 中调用
 */
export const setGlobalPricingModalHandler = (handler: (permission?: string | null) => void) => {
  globalOpenPricingModal = handler;
};

/**
 * 重置全局的 pricing 浮层处理函数
 * 在 PricingContext Provider 清理时调用
 */
export const resetGlobalPricingModalHandler = () => {
  globalOpenPricingModal = null;
};

/**
 * 触发全局 pricing 浮层
 * 在收到 402 响应时调用
 */
export const triggerPricingModal = (permission?: string | null) => {
  if (globalOpenPricingModal) {
    globalOpenPricingModal(permission);
  } else {
    // 等待一小段时间让 PricingContext Provider 初始化完成
    const waitForModalHandler = (retryCount = 0) => {
      if (globalOpenPricingModal) {
        globalOpenPricingModal(permission);
      } else if (retryCount < 5) {
        // 等待50ms后重试，最多重试5次
        setTimeout(() => waitForModalHandler(retryCount + 1), 50);
      } else {
        // 超过重试次数后才降级到页面跳转
        console.warn('PricingContext Provider未能及时初始化，降级到页面跳转');
        window.location.href = '/pricing';
      }
    };

    waitForModalHandler();
  }
};

/**
 * 检查当前路径是否需要弹出登录浮层
 */
const PUBLIC_ROUTES_WITHOUT_LOGIN_MODAL = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-code',
  '/verify-education',
  '/verify-forgot-password',
  '/reset-password',
  '/redeem',
  '/pricing',
  '/terms',
];

const normalizePathname = (pathname: string) => {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

export const shouldShowLoginModal = (pathname: string): boolean => {
  const normalizedPath = normalizePathname(pathname);
  return !PUBLIC_ROUTES_WITHOUT_LOGIN_MODAL.includes(normalizedPath);
};
