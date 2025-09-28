import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { setGlobalLoginModalHandler } from '@/utils/authHelpers';

interface LoginModalContextType {
  isOpen: boolean;
  redirectPath?: string;
  openLoginModal: (redirectPath?: string) => void;
  closeLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

interface LoginModalProviderProps {
  children: ReactNode;
}

export const LoginModalProvider = ({ children }: LoginModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | undefined>();

  const openLoginModal = useCallback((newRedirectPath?: string) => {
    setRedirectPath(newRedirectPath);
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
    setRedirectPath(undefined);
  }, []);

  // 设置全局登录浮层处理函数
  useEffect(() => {
    setGlobalLoginModalHandler(openLoginModal);
    
    // 清理函数
    return () => {
      setGlobalLoginModalHandler(() => {});
    };
  }, [openLoginModal]);

  const value: LoginModalContextType = {
    isOpen,
    redirectPath,
    openLoginModal,
    closeLoginModal,
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
