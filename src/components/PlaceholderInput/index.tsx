import React, { useRef } from 'react';
import type { FC, KeyboardEvent, ChangeEvent, FocusEvent } from 'react';

interface PlaceholderInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  enableTabFill?: boolean;
  type?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const PlaceholderInput: FC<PlaceholderInputProps> = ({
  value,
  onChange,
  placeholder = '',
  enableTabFill = true,
  type = 'text',
  className = '',
  style,
  disabled = false,
  readOnly = false,
  id,
  name,
  autoComplete,
  onKeyDown,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 禁用或只读状态不处理
    if (disabled || readOnly) {
      onKeyDown?.(e);
      return;
    }

    // 检查是否按下 Tab 键（非 Shift+Tab）
    if (e.key === 'Tab' && !e.shiftKey && enableTabFill) {
      const currentValue = value.trim();
      const placeholderValue = placeholder.trim();

      // 只有在输入框为空且有 placeholder 时才拦截
      if (currentValue === '' && placeholderValue !== '') {
        e.preventDefault();
        onChange(placeholderValue);

        // 光标移动到末尾
        setTimeout(() => {
          if (inputRef.current) {
            const length = placeholderValue.length;
            inputRef.current.setSelectionRange(length, length);
          }
        }, 0);

        return; // 已处理，不调用外部回调
      }
    }

    // 未触发填充逻辑，调用外部回调
    onKeyDown?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type={type}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      style={style}
      disabled={disabled}
      readOnly={readOnly}
      id={id}
      name={name}
      autoComplete={autoComplete}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
    />
  );
};

export default PlaceholderInput;
