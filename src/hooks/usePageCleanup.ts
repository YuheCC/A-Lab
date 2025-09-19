import { useEffect } from 'react';

/**
 * 页面离开时清理浮层相关的className
 * 主要清理chat-container上的molecule-panel-active、expanded等类名
 */
export function usePageCleanup(pathname?: string) {
  useEffect(() => {
    const cleanupFloatingLayerClasses = () => {
      // 清理chat-container上的浮层相关类名
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        chatContainer.classList.remove('molecule-panel-active', 'expanded');
      }

      // 清理molecule-panel上的expanded类名
      const moleculePanel = document.querySelector('.molecule-panel');
      if (moleculePanel) {
        moleculePanel.classList.remove('expanded');
      }

      // 清理main-container上可能存在的其他浮层相关类名
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        // 清理所有可能的布局相关类名
        mainContainer.classList.remove('molecule-panel-active', 'expanded');
        
        // 强制重置可能影响其他页面的样式
        mainContainer.style.removeProperty('max-width');
        mainContainer.style.removeProperty('width');
        mainContainer.style.removeProperty('min-width');
        
        // 清理CSS变量
        mainContainer.style.removeProperty('--molecule-panel-width');
        mainContainer.style.removeProperty('--sidebar-collapsed-width');
        mainContainer.style.removeProperty('--sidebar-normal-width');
        mainContainer.style.removeProperty('--chat-main-width');
      }

      // 清理任何可能残留的聊天相关容器样式
      const chatAndMolecules = document.querySelector('.chat-and-molecules');
      if (chatAndMolecules) {
        chatAndMolecules.classList.remove('molecule-panel-active', 'expanded');
        // 清理CSS变量
        chatAndMolecules.style.removeProperty('--molecule-panel-width');
        chatAndMolecules.style.removeProperty('--sidebar-collapsed-width');
        chatAndMolecules.style.removeProperty('--sidebar-normal-width');
        chatAndMolecules.style.removeProperty('--chat-main-width');
      }

      // 清理chatbot-content的宽度限制
      const chatbotContent = document.querySelector('.chatbot-content');
      if (chatbotContent) {
        chatbotContent.classList.remove('with-molecules');
        chatbotContent.style.removeProperty('max-width');
        chatbotContent.style.removeProperty('width');
        // 清理CSS变量
        chatbotContent.style.removeProperty('--molecule-panel-width');
        chatbotContent.style.removeProperty('--sidebar-collapsed-width');
        chatbotContent.style.removeProperty('--chat-main-width');
      }

      // 清理body上可能的chat相关类名
      document.body.classList.remove('chat-page-body');
    };

    // 页面路由变化时执行清理
    cleanupFloatingLayerClasses();

    // 返回清理函数，在组件卸载时执行
    return () => {
      cleanupFloatingLayerClasses();
    };
  }, [pathname]); // 依赖pathname，路由变化时重新执行

  // 也提供手动清理的方法
  const manualCleanup = () => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.classList.remove('molecule-panel-active', 'expanded');
    }

    const moleculePanel = document.querySelector('.molecule-panel');
    if (moleculePanel) {
      moleculePanel.classList.remove('expanded');
    }

    // 清理main-container的样式
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
      mainContainer.classList.remove('molecule-panel-active', 'expanded');
      mainContainer.style.removeProperty('max-width');
      mainContainer.style.removeProperty('width');
      mainContainer.style.removeProperty('min-width');
      // 清理CSS变量
      mainContainer.style.removeProperty('--molecule-panel-width');
      mainContainer.style.removeProperty('--sidebar-collapsed-width');
      mainContainer.style.removeProperty('--sidebar-normal-width');
      mainContainer.style.removeProperty('--chat-main-width');
    }

    // 清理chatbot-content的宽度限制
    const chatbotContent = document.querySelector('.chatbot-content');
    if (chatbotContent) {
      chatbotContent.classList.remove('with-molecules');
      chatbotContent.style.removeProperty('max-width');
      chatbotContent.style.removeProperty('width');
      // 清理CSS变量
      chatbotContent.style.removeProperty('--molecule-panel-width');
      chatbotContent.style.removeProperty('--sidebar-collapsed-width');
      chatbotContent.style.removeProperty('--chat-main-width');
    }
  };

  return {
    manualCleanup
  };
}