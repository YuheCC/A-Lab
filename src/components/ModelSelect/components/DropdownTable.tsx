import React, { useState } from 'react';
import { ModelSelectOption, ModelSelectGroup, ColumnConfig } from '../types';
import TableRow from './TableRow';

interface DropdownTableProps {
  columns: ColumnConfig[];
  options?: ModelSelectOption[];
  groups?: ModelSelectGroup[];
  onSelect: (id: string) => void;
  isSelected: (id: string) => boolean;
  mode: 'single' | 'multiple';
  highlightedIndex: number;
  pageSize?: number;
}

const DropdownTable: React.FC<DropdownTableProps> = ({
  columns,
  options,
  groups,
  onSelect,
  isSelected,
  mode,
  highlightedIndex,
  pageSize = 20,
}) => {
  const [displayCount, setDisplayCount] = useState(pageSize);

  // 计算 grid-template-columns
  const gridColumns = [
    mode === 'multiple' ? 'auto' : null,
    ...columns.map((col) => col.width || 'auto'),
  ]
    .filter(Boolean)
    .join(' ');

  // 渲染内容：支持分组和非分组
  const renderContent = () => {
    if (groups && groups.length > 0) {
      // 分组模式
      let globalIndex = 0;
      return groups.map((group, groupIdx) => {
        const visibleOptions =
          groupIdx === 0
            ? group.options.slice(0, displayCount)
            : group.options;
        const content = (
          <div key={group.label} className="model-select-group">
            <div className="model-select-group__header">{group.label}</div>
            <div className="model-select-group__body">
              {visibleOptions.map((option) => {
                const currentIndex = globalIndex++;
                return (
                  <TableRow
                    key={option.id}
                    option={option}
                    columns={columns}
                    onSelect={onSelect}
                    isSelected={isSelected(String(option.id))}
                    isHighlighted={currentIndex === highlightedIndex}
                    mode={mode}
                  />
                );
              })}
            </div>
            {/* 第一个分组显示加载更多 */}
            {groupIdx === 0 && displayCount < group.options.length && (
              <div
                className="model-select-load-more"
                onClick={() => setDisplayCount((prev) => prev + pageSize)}
              >
                加载更多 ({group.options.length - displayCount} 项未显示)
              </div>
            )}
          </div>
        );
        return content;
      });
    } else if (options && options.length > 0) {
      // 非分组模式
      const visibleOptions = options.slice(0, displayCount);
      return (
        <>
          {visibleOptions.map((option, index) => (
            <TableRow
              key={option.id}
              option={option}
              columns={columns}
              onSelect={onSelect}
              isSelected={isSelected(String(option.id))}
              isHighlighted={index === highlightedIndex}
              mode={mode}
            />
          ))}
          {displayCount < options.length && (
            <div
              className="model-select-load-more"
              onClick={() => setDisplayCount((prev) => prev + pageSize)}
            >
              加载更多 ({options.length - displayCount} 项未显示)
            </div>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div
      className="model-select-table"
      style={{ '--grid-columns': gridColumns } as React.CSSProperties}
    >
      {/* 表头 */}
      <div className="model-select-table__header">
        {mode === 'multiple' && <div className="table-col-checkbox" />}
        {columns.map((col) => (
          <div key={col.key} className="table-col" style={{ width: col.width }}>
            {col.title}
          </div>
        ))}
      </div>

      {/* 数据行（支持分组） */}
      <div className="model-select-table__body">{renderContent()}</div>
    </div>
  );
};

export default DropdownTable;
