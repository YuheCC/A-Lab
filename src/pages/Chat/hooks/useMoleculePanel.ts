import { useState, useEffect, useCallback } from 'react';
import { setupResponsiveLayout, toggleMoleculePanelExpansion, type LayoutDimensions } from '../utils/layoutUtils';

export interface MoleculePanelState {
  isVisible: boolean;
  isExpanded: boolean;
  currentMolecule: string | null;
  dimensions: LayoutDimensions | null;
}

export function useMoleculePanel() {
  const [state, setState] = useState<MoleculePanelState>({
    isVisible: false,
    isExpanded: false,
    currentMolecule: null,
    dimensions: null,
  });

  // 显示分子面板
  const showPanel = useCallback((moleculeName: string, expanded: boolean = false) => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      isExpanded: expanded,
      currentMolecule: moleculeName,
    }));

    // 应用布局变化
    setTimeout(() => {
      toggleMoleculePanelExpansion(expanded, (dimensions) => {
        setState(prev => ({ ...prev, dimensions }));
      });
      
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        chatContainer.classList.add('molecule-panel-active');
        if (expanded) {
          chatContainer.classList.add('expanded');
        }
      }
    }, 50);
  }, []);

  // 隐藏分子面板
  const hidePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      isExpanded: false,
      currentMolecule: null,
    }));

    // 移除布局类
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.classList.remove('molecule-panel-active', 'expanded');
    }
  }, []);

  // 切换展开状态
  const toggleExpansion = useCallback(() => {
    const newExpanded = !state.isExpanded;
    setState(prev => ({ ...prev, isExpanded: newExpanded }));

    toggleMoleculePanelExpansion(newExpanded, (dimensions) => {
      setState(prev => ({ ...prev, dimensions }));
    });

    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      if (newExpanded) {
        chatContainer.classList.add('expanded');
      } else {
        chatContainer.classList.remove('expanded');
      }
    }
  }, [state.isExpanded]);

  // 处理分子点击
  const handleMoleculeClick = useCallback((moleculeName: string) => {
    showPanel(moleculeName, false);
  }, [showPanel]);

  // 处理查找相似分子
  const handleFindSimilar = useCallback((moleculeName: string) => {
    if (state.isVisible && state.currentMolecule === moleculeName) {
      // 如果已经显示相同分子，则切换展开状态
      toggleExpansion();
    } else {
      // 显示新分子并展开
      showPanel(moleculeName, true);
    }
  }, [state.isVisible, state.currentMolecule, showPanel, toggleExpansion]);

  // 设置响应式布局监听
  useEffect(() => {
    const cleanupLayout = setupResponsiveLayout(state.isExpanded, (dimensions) => {
      setState(prev => ({ ...prev, dimensions }));
    });

    return cleanupLayout;
  }, [state.isExpanded]);

  return {
    state,
    showPanel,
    hidePanel,
    toggleExpansion,
    handleMoleculeClick,
    handleFindSimilar,
  };
}