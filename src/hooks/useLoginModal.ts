import { useLoginModal as useLoginModalContext } from '@/contexts/LoginModalContext';
import { useAuthStore } from '@/models/useAuth';

/**
 * 用于在组件中方便地使用登录浮层的Hook
 * 
 * @returns 登录浮层相关的方法和状态
 */
export const useLoginModal = () => {
  const loginModal = useLoginModalContext();
  const { isAuthenticated } = useAuthStore();

  /**
   * 检查认证状态，如果未登录则弹出登录浮层
   * @param redirectPath 登录成功后的重定向路径
   * @returns 是否已认证
   */
  const requireAuth = (redirectPath?: string): boolean => {
    if (!isAuthenticated) {
      loginModal.openLoginModal(redirectPath);
      return false;
    }
    return true;
  };

  /**
   * 用于权限保护的装饰器函数
   * @param action 需要权限的操作
   * @param redirectPath 登录成功后的重定向路径
   * @returns 包装后的函数
   */
  const withAuth = <T extends (...args: any[]) => any>(
    action: T,
    redirectPath?: string
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | void => {
      if (requireAuth(redirectPath)) {
        return action(...args);
      }
    };
  };

  return {
    ...loginModal,
    requireAuth,
    withAuth,
    isAuthenticated,
  };
};

export default useLoginModal;
