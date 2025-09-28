import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

export const useLoginModal = (): LoginModalContextType => {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
};

export default LoginModalContext;
