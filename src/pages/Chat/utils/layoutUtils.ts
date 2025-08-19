/**
 * 聊天页面布局工具函数
 * 用于动态调整分子面板和聊天区域的宽度
 */

export interface LayoutDimensions {
  moleculePanelWidth: number;
  sidebarCollapsedWidth: number;
  chatMainWidth: number;
}

/**
 * 计算布局尺寸
 * @param isExpanded 分子面板是否展开
 * @param viewportWidth 视窗宽度
 * @returns 布局尺寸对象
 */
export function calculateLayoutDimensions(
  isExpanded: boolean = false,
  viewportWidth: number = window.innerWidth
): LayoutDimensions {
  // 基础宽度配置
  const baseConfig = {
    moleculePanelCollapsed: 380,
    moleculePanelExpanded: 730,
    sidebarCollapsed: 50,
    sidebarNormal: 220,
  };

  // 响应式调整
  let moleculePanelWidth: number;
  let sidebarCollapsedWidth: number;

  if (viewportWidth <= 768) {
    // 移动端
    moleculePanelWidth = viewportWidth;
    sidebarCollapsedWidth = 0;
  } else if (viewportWidth <= 1200) {
    // 中等屏幕
    moleculePanelWidth = isExpanded 
      ? Math.min(baseConfig.moleculePanelExpanded, viewportWidth * 0.6)
      : Math.min(baseConfig.moleculePanelCollapsed, viewportWidth * 0.4);
    sidebarCollapsedWidth = baseConfig.sidebarCollapsed;
  } else {
    // 大屏幕
    moleculePanelWidth = isExpanded 
      ? baseConfig.moleculePanelExpanded 
      : baseConfig.moleculePanelCollapsed;
    sidebarCollapsedWidth = baseConfig.sidebarCollapsed;
  }

  const chatMainWidth = viewportWidth - moleculePanelWidth - sidebarCollapsedWidth;

  return {
    moleculePanelWidth,
    sidebarCollapsedWidth,
    chatMainWidth: Math.max(chatMainWidth, 300), // 最小宽度保护
  };
}

/**
 * 应用布局CSS变量
 * @param dimensions 布局尺寸
 * @param containerElement 容器元素，默认为document.documentElement
 */
export function applyLayoutVariables(
  dimensions: LayoutDimensions,
  containerElement: HTMLElement = document.documentElement
): void {
  containerElement.style.setProperty('--molecule-panel-width', `${dimensions.moleculePanelWidth}px`);
  containerElement.style.setProperty('--sidebar-collapsed-width', `${dimensions.sidebarCollapsedWidth}px`);
  containerElement.style.setProperty('--chat-main-width', `${dimensions.chatMainWidth}px`);
}

/**
 * 监听窗口大小变化并自动调整布局
 * @param isExpanded 分子面板是否展开
 * @param callback 布局变化回调函数
 * @returns 清理函数
 */
export function setupResponsiveLayout(
  isExpanded: boolean = false,
  callback?: (dimensions: LayoutDimensions) => void
): () => void {
  const handleResize = () => {
    const dimensions = calculateLayoutDimensions(isExpanded, window.innerWidth);
    applyLayoutVariables(dimensions);
    callback?.(dimensions);
  };

  // 初始化
  handleResize();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);

  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}

/**
 * 切换分子面板展开状态
 * @param isExpanded 是否展开
 * @param callback 切换完成回调
 */
export function toggleMoleculePanelExpansion(
  isExpanded: boolean,
  callback?: (dimensions: LayoutDimensions) => void
): void {
  const dimensions = calculateLayoutDimensions(isExpanded, window.innerWidth);
  applyLayoutVariables(dimensions);
  
  // 添加/移除展开类
  const chatContainer = document.querySelector('.chat-container');
  const moleculePanel = document.querySelector('.molecule-panel');
  
  if (chatContainer && moleculePanel) {
    if (isExpanded) {
      chatContainer.classList.add('expanded');
      moleculePanel.classList.add('expanded');
    } else {
      chatContainer.classList.remove('expanded');
      moleculePanel.classList.remove('expanded');
    }
  }
  
  callback?.(dimensions);
}

/**
 * 获取当前布局状态
 * @returns 当前布局尺寸
 */
export function getCurrentLayoutDimensions(): LayoutDimensions {
  const chatContainer = document.querySelector('.chat-container');
  const isExpanded = chatContainer?.classList.contains('expanded') || false;
  return calculateLayoutDimensions(isExpanded, window.innerWidth);
}