/**
 * LoginModal 使用示例
 * 
 * 这个文件展示了如何在不同场景下使用 LoginModal 组件
 */

import { useState } from 'react';
import { useNavigate } from 'umi';
import LoginModal from './index';

// 示例1: 基础使用 - 在Header中替换登录按钮
export const HeaderWithLoginModal = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="header">
      <button 
        onClick={() => setShowLoginModal(true)}
        className="login-button"
      >
        登录
      </button>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath="/dashboard"
      />
    </div>
  );
};

// 示例2: 权限拦截 - 在需要登录时自动弹出
export const ProtectedComponent = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleProtectedAction = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      // 执行需要权限的操作
      console.log('执行保护操作');
    }
  };

  return (
    <div>
      <button onClick={handleProtectedAction}>
        需要登录的操作
      </button>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath="/protected-area"
      />
    </div>
  );
};

// 示例3: 全局状态管理（建议使用的模式）
interface LoginModalState {
  isOpen: boolean;
  redirectPath?: string;
}

// 可以在 useAuthStore 或单独的 hook 中管理
export const useLoginModal = () => {
  const [modalState, setModalState] = useState<LoginModalState>({
    isOpen: false,
    redirectPath: undefined
  });

  const openLoginModal = (redirectPath?: string) => {
    setModalState({ isOpen: true, redirectPath });
  };

  const closeLoginModal = () => {
    setModalState({ isOpen: false, redirectPath: undefined });
  };

  return {
    ...modalState,
    openLoginModal,
    closeLoginModal
  };
};

// 示例4: 与路由守卫集成
export const AppWithLoginModal = () => {
  const { isOpen, redirectPath, openLoginModal, closeLoginModal } = useLoginModal();
  const navigate = useNavigate();

  // 在路由守卫中使用
  const checkAuthAndNavigate = (path: string) => {
    const isAuthenticated = false; // 从 auth store 获取
    
    if (isAuthenticated) {
      navigate(path);
    } else {
      openLoginModal(path);
    }
  };

  return (
    <div className="app">
      {/* 你的应用内容 */}
      
      <LoginModal
        isOpen={isOpen}
        onClose={closeLoginModal}
        redirectPath={redirectPath}
      />
    </div>
  );
};

// 示例5: 响应不同的登录触发场景
export const MultiScenarioExample = () => {
  const [loginConfig, setLoginConfig] = useState<{
    isOpen: boolean;
    redirectPath?: string;
    source?: string;
  }>({
    isOpen: false
  });

  const handleLoginFromFavorites = () => {
    setLoginConfig({
      isOpen: true,
      redirectPath: '/favorites',
      source: 'favorites'
    });
  };

  const handleLoginFromSearch = () => {
    setLoginConfig({
      isOpen: true,
      redirectPath: '/search',
      source: 'search'
    });
  };

  const handleLoginFromPricing = () => {
    setLoginConfig({
      isOpen: true,
      redirectPath: '/pricing',
      source: 'pricing'
    });
  };

  return (
    <div>
      <button onClick={handleLoginFromFavorites}>
        查看收藏（需要登录）
      </button>
      
      <button onClick={handleLoginFromSearch}>
        高级搜索（需要登录）
      </button>
      
      <button onClick={handleLoginFromPricing}>
        查看定价（需要登录）
      </button>
      
      <LoginModal
        isOpen={loginConfig.isOpen}
        onClose={() => setLoginConfig({ isOpen: false })}
        redirectPath={loginConfig.redirectPath}
      />
    </div>
  );
};

export default {
  HeaderWithLoginModal,
  ProtectedComponent,
  useLoginModal,
  AppWithLoginModal,
  MultiScenarioExample
};
