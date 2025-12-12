import React from 'react';
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
  const handleClick = () => {
    onSelect(String(option[valueField]));
  };

  const rowClassName = `model-select-table-row${isSelected ? ' model-select-table-row--selected' : ''}${isHighlighted ? ' model-select-table-row--highlighted' : ''}`;

  return (
    <div className={rowClassName} onClick={handleClick} role="option" aria-selected={isSelected}>
      {mode === 'multiple' && (
        <div className="table-col-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {columns.map((col) => (
        <div key={col.key} className="table-col">
          {col.render
            ? col.render(option[col.key], option)
            : String(option[col.key] || '')}
        </div>
      ))}
    </div>
  );
};

export default TableRow;
