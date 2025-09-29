import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { setGlobalLoginModalHandler, resetGlobalLoginModalHandler } from '@/utils/authHelpers';

interface LoginModalContextType {
  isOpen: boolean;
  redirectPath?: string;
  onLogin?: () => void;
  openLoginModal: (redirectPath?: string) => void;
  closeLoginModal: () => void;
  setOnLogin: (callback?: () => void) => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

interface LoginModalProviderProps {
  children: ReactNode;
}

export const LoginModalProvider = ({ children }: LoginModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | undefined>();
  const [onLogin, setOnLoginCallback] = useState<(() => void) | undefined>();

  const openLoginModal = useCallback((newRedirectPath?: string) => {
    setRedirectPath(newRedirectPath);
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
    setRedirectPath(undefined);
  }, []);

  const setOnLogin = useCallback((callback?: () => void) => {
    setOnLoginCallback(() => callback);
  }, []);

  // 设置全局登录浮层处理函数
  useEffect(() => {
    setGlobalLoginModalHandler(openLoginModal);

    // 清理函数，重置全局处理器
    return () => {
      resetGlobalLoginModalHandler();
    };
  }, [openLoginModal]);

  const value: LoginModalContextType = {
    isOpen,
    redirectPath,
    onLogin,
    openLoginModal,
    closeLoginModal,
    setOnLogin,
  };

  return (
    <LoginModalContext.Provider value={value}>
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModalContext = (): LoginModalContextType => {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error('useLoginModalContext must be used within a LoginModalProvider');
  }
  return context;
};

export default LoginModalContext;
