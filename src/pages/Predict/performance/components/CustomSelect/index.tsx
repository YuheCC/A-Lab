import React, { useState, useRef, useEffect } from 'react';
import './index.css';

interface Option {
  id: string | number;
  name: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  onOptionClick?: (option: Option, isSelected: boolean) => void;
  options: Option[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  onOptionClick,
  options,
  disabled = false,
  placeholder = '',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: Option) => {
    const isCurrentlySelected = value === option.name || (Number(option.id) === 1 && value === option.name);

    // 总是触发option点击事件，无论是否disabled或已选中
    onOptionClick?.(option, isCurrentlySelected);

    // 只有非disabled的option才能被选中
    if (!option.disabled) {
      const newValue = Number(option.id) === 1 ? option.name : "";
      onChange(newValue);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selectedOption = options.find(opt =>
      opt.name === value || (Number(opt.id) === 1 && opt.name === value)
    );
    return selectedOption?.name || value;
  };

  return (
    <div
      className={`custom-select ${className} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      ref={selectRef}
    >
      <div
        className="custom-select-trigger"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="custom-select-value">
          {getDisplayValue()}
        </span>
        <span className="custom-select-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="custom-select-options" role="listbox">
          {options.map((option) => (
            <div
              key={option.id}
              className={`custom-select-option ${
                option.disabled ? 'disabled' : ''
              } ${
                (value === option.name || (Number(option.id) === 1 && value === option.name)) ? 'selected' : ''
              }`}
              onClick={() => handleOptionClick(option)}
              role="option"
              aria-selected={value === option.name}
            >
              {option.name}
              {Number(option.id) !== 1 ? ' (Will be available soon)' : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;