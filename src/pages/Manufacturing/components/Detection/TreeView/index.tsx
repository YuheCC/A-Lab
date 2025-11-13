import React, { useState } from 'react';
import './index.less';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export interface TreeViewProps {
  data: TreeNode[];
  max?: number;
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  data,
  max = 10,
  selectedId,
  onSelect,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // 处理节点展开/收起
  const toggleExpand = (nodeId: string) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(nodeId)) {
      newExpandedKeys.delete(nodeId);
    } else {
      newExpandedKeys.add(nodeId);
    }
    setExpandedKeys(newExpandedKeys);
  };

  // 处理节点选择
  const handleSelect = (node: TreeNode) => {
    if (onSelect) {
      onSelect(node);
    }
  };

  // 渲染单个树节点
  const renderTreeNode = (
    node: TreeNode,
    level: number = 0,
    isCollapsed: boolean = false,
  ): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div
          className={`tree-node ${isSelected ? 'tree-node-selected' : ''} ${
            isCollapsed ? 'tree-node-collapsed' : ''
          }`}
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => !isCollapsed && handleSelect(node)}
        >
          {hasChildren && !isCollapsed && (
            <span
              className={`tree-node-arrow ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              ▶
            </span>
          )}
          {(!hasChildren || isCollapsed) && (
            <span className="tree-node-arrow-placeholder"></span>
          )}
          <span className="tree-node-label">{node.label}</span>
        </div>
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="tree-node-children">
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 渲染树
  const renderTree = () => {
    const visibleNodes = data.slice(0, max);
    const collapsedCount = data.length - max;

    return (
      <div className="tree-view">
        {visibleNodes.map((node) => renderTreeNode(node, 0, false))}
        {collapsedCount > 0 && (
          <div className="tree-node tree-node-collapsed" style={{ paddingLeft: 0 }}>
            <span className="tree-node-arrow-placeholder"></span>
            <span className="tree-node-label">
              更多... (剩余 {collapsedCount} 项)
            </span>
          </div>
        )}
      </div>
    );
  };

  return renderTree();
};

export default TreeView;
