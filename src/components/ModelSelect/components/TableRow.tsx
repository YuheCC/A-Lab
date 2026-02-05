import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModelSelectOption, ColumnConfig } from '../types';

interface TableRowProps {
  option: ModelSelectOption;
  columns: ColumnConfig[];
  onSelect: (id: string) => void;
  isSelected: boolean;
  isHighlighted: boolean;
  mode: 'single' | 'multiple';
  valueField?: string;
}

const TableRow: React.FC<TableRowProps> = ({
  option,
  columns,
  onSelect,
  isSelected,
  isHighlighted,
  mode,
  valueField = 'id',
}) => {
  const { t } = useTranslation();
  const isDisabled = option.disabled || false;

  const handleClick = () => {
    // 禁用的行不响应点击事件
    if (isDisabled) {
      return;
    }
    onSelect(String(option[valueField]));
  };

  const rowClassName = `model-select-table-row${isSelected ? ' model-select-table-row--selected' : ''}${isHighlighted ? ' model-select-table-row--highlighted' : ''}${isDisabled ? ' model-select-table-row--disabled' : ''}`;

  return (
    <div className={rowClassName} onClick={handleClick} role="option" aria-selected={isSelected} aria-disabled={isDisabled}>
      {mode === 'multiple' && (
        <div className="table-col-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isDisabled}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {columns.map((col) => {
        // 对于 name 列，如果有 disabledText，则追加多语言文案
        const cellValue = col.render
          ? col.render(option[col.key], option)
          : String(option[col.key] || '');
        
        const displayValue = col.key === 'name' && option.disabledText
          ? `${cellValue} ${t(option.disabledText)}`
          : cellValue;

        return (
          <div key={col.key} className="table-col">
            {displayValue}
          </div>
        );
      })}
    </div>
  );
};

export default TableRow;
