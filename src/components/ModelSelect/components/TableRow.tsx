import React from 'react';
import { ModelSelectOption, ColumnConfig } from '../types';

interface TableRowProps {
  option: ModelSelectOption;
  columns: ColumnConfig[];
  onSelect: (id: string) => void;
  isSelected: boolean;
  isHighlighted: boolean;
  mode: 'single' | 'multiple';
}

const TableRow: React.FC<TableRowProps> = ({
  option,
  columns,
  onSelect,
  isSelected,
  isHighlighted,
  mode,
}) => {
  const handleClick = () => {
    onSelect(String(option.id));
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
        <div key={col.key} className="table-col" style={{ width: col.width }}>
          {col.render
            ? col.render(option[col.key], option)
            : String(option[col.key] || '')}
        </div>
      ))}
    </div>
  );
};

export default TableRow;
