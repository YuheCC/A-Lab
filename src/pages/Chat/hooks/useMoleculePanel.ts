import { useState, useEffect, useCallback } from 'react';
import { setupResponsiveLayout, toggleMoleculePanelExpansion, type LayoutDimensions } from '../utils/layoutUtils';

// 定义分子对象的接口结构
export interface MoleculeData {
  name: string;
  SMILES: string;
  cation?: string;
  isAnion?: boolean;
  molecular_weight?: number;
  HOMO_eV?: number;
  LUMO_eV?: number;
  ESP_min_eV?: number;
  ESP_max_eV?: number;
  predicted_MP_celsius?: number;
  predicted_BP_celsius?: number;
  predicted_FP_celsius?: number;
  COMBUSTION_ENTHALPY_EV?: number;
  vdw_volume_angstroms3?: number;
  fluoride_bde_ev?: number;
  COMMERCIAL_SCORE?: number;
  COMMERCIAL_LINK?: string;
  functional_groups?: string;
  UMAP_0?: number;
  UMAP_1?: number;
  grade?: number;
  reasoning?: string;
}

export interface MoleculePanelState {
  isVisible: boolean;
  isExpanded: boolean;
  currentMolecule: MoleculeData | null;
  dimensions: LayoutDimensions | null;
}

export function useMoleculePanel(setIsSidebarCollapsed?: (collapsed: boolean) => void) {
  const [state, setState] = useState<MoleculePanelState>({
    isVisible: false,
    isExpanded: false,
    currentMolecule: null,
    dimensions: null,
  });

  // 显示分子面板
  const showPanel = useCallback((molecule: MoleculeData, expanded: boolean = false) => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      isExpanded: expanded,
      currentMolecule: molecule,
    }));

    // 当分子面板展开时，收缩侧边栏
    setIsSidebarCollapsed?.(true);

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
  }, [setIsSidebarCollapsed]);

  // 隐藏分子面板
  const hidePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      isExpanded: false,
      currentMolecule: null,
    }));
    
    setIsSidebarCollapsed?.(false);

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

    // 当分子面板展开时，收缩侧边栏
    if (newExpanded && setIsSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }

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
  }, [state.isExpanded, setIsSidebarCollapsed]);

  // 处理分子点击
  const handleMoleculeClick = useCallback((molecule: MoleculeData) => {
    showPanel(molecule, false);
  }, [showPanel]);

  // 处理查找相似分子
  const handleFindSimilar = useCallback((molecule: MoleculeData) => {
    const currentMoleculeName = state.currentMolecule?.name || state.currentMolecule?.SMILES;
    const targetMoleculeName = molecule?.name || molecule?.SMILES;
    
    if (state.isVisible && currentMoleculeName === targetMoleculeName) {
      // 如果已经显示相同分子，确保面板保持展开状态（支持多次查询）
      if (!state.isExpanded) {
        toggleExpansion();
      }
      // 否则保持当前展开状态，让 MoleculeModal 内部处理重新查询
    } else {
      // 显示新分子并展开
      showPanel(molecule, true);
    }
  }, [state.isVisible, state.isExpanded, state.currentMolecule, showPanel, toggleExpansion]);

  // 设置响应式布局监听
  useEffect(() => {
    const cleanupLayout = setupResponsiveLayout(
      state.isExpanded, 
      (dimensions) => {
        setState(prev => ({ ...prev, dimensions }));
      },
      {
        debounceMs: 150,  // 防抖延迟150ms
        threshold: 50     // 宽度变化阈值50px
      }
    );

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
