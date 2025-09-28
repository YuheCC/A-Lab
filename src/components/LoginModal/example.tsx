/**
 * LoginModal 使用示例
 * 
 * 这个文件展示了如何在不同场景下使用 LoginModal 组件和Context
 */

import { useState } from 'react';
import { useNavigate } from 'umi';
import { useLoginModal } from '@/hooks/useLoginModal';
import LoginModal from './index';

// 示例1: 使用Context - 在Header中替换登录按钮（推荐方式）
export const HeaderWithLoginModal = () => {
  const { openLoginModal } = useLoginModal();

  return (
    <div className="header">
      <button 
        onClick={() => openLoginModal('/dashboard')}
        className="login-button"
      >
        登录
      </button>
      {/* 不需要再包含 LoginModal 组件，因为已经在 layout 中全局集成 */}
    </div>
  );
};

// 示例1.1: 传统方式（不推荐，但仍然可用）
export const HeaderWithLocalModal = () => {
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

// 示例2: 权限拦截 - 使用Context（推荐方式）
export const ProtectedComponent = () => {
  const { requireAuth, withAuth } = useLoginModal();

  const handleProtectedAction = () => {
    if (requireAuth('/protected-area')) {
      // 执行需要权限的操作
      console.log('执行保护操作');
    }
  };

  // 或者使用装饰器模式
  const protectedAction = withAuth(() => {
    console.log('执行保护操作');
  }, '/protected-area');

  return (
    <div>
      <button onClick={handleProtectedAction}>
        需要登录的操作 (方式1)
      </button>
      
      <button onClick={protectedAction}>
        需要登录的操作 (方式2)
      </button>
    </div>
  );
};

// 示例3: 复杂场景 - 在现有组件中添加登录检查
export const FavoritesButton = ({ molecule }: { molecule: any }) => {
  const { withAuth } = useLoginModal();

  const handleAddToFavorites = withAuth(async () => {
    // 添加到收藏夹的逻辑
    console.log('添加到收藏夹:', molecule);
  }, '/favorites');

  return (
    <button onClick={handleAddToFavorites}>
      添加到收藏夹
    </button>
  );
};

// 示例4: 路由守卫集成（现在更简单了，因为LoginModal已在layout中）
export const NavigationComponent = () => {
  const { requireAuth } = useLoginModal();
  const navigate = useNavigate();

  const navigateToProtectedPage = (path: string) => {
    if (requireAuth(path)) {
      navigate(path);
    }
    // 如果未认证，requireAuth会自动弹出登录浮层
  };

  return (
    <div className="navigation">
      <button onClick={() => navigateToProtectedPage('/dashboard')}>
        去仪表板
      </button>
      <button onClick={() => navigateToProtectedPage('/favorites')}>
        我的收藏
      </button>
      <button onClick={() => navigateToProtectedPage('/settings')}>
        设置
      </button>
    </div>
  );
};

// 示例5: 响应不同的登录触发场景（使用Context简化）
export const MultiScenarioExample = () => {
  const { openLoginModal } = useLoginModal();

  return (
    <div>
      <button onClick={() => openLoginModal('/favorites')}>
        查看收藏（需要登录）
      </button>
      
      <button onClick={() => openLoginModal('/search')}>
        高级搜索（需要登录）
      </button>
      
      <button onClick={() => openLoginModal('/pricing')}>
        查看定价（需要登录）
      </button>
      
      {/* 不需要再包含LoginModal，因为已在layout中全局集成 */}
    </div>
  );
};

// 示例6: 在现有业务逻辑中集成
export const SearchComponent = () => {
  const { requireAuth } = useLoginModal();

  const handleAdvancedSearch = () => {
    // 检查权限，如果未登录会自动弹出登录浮层
    if (requireAuth('/search')) {
      // 执行高级搜索逻辑
      console.log('执行高级搜索');
    }
  };

  const handleSaveSearch = () => {
    if (requireAuth()) {
      // 保存搜索，登录后不重定向到特定页面
      console.log('保存搜索结果');
    }
  };

  return (
    <div>
      <button onClick={handleAdvancedSearch}>
        高级搜索
      </button>
      <button onClick={handleSaveSearch}>
        保存搜索
      </button>
    </div>
  );
};

export default {
  HeaderWithLoginModal,
  HeaderWithLocalModal,
  ProtectedComponent,
  FavoritesButton,
  NavigationComponent,
  MultiScenarioExample,
  SearchComponent
};
