import { useState, useEffect } from 'react';
import { ModelSelectOption } from '../types';

/**
 * 键盘导航 Hook
 * @param isOpen 是否打开下拉框
 * @param filteredOptions 过滤后的选项列表
 * @param onSelect 选择回调
 * @param onClose 关闭回调
 */
export const useKeyboard = (
  isOpen: boolean,
  filteredOptions: ModelSelectOption[],
  onSelect: (id: string) => void,
  onClose: () => void
) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredOptions.length
          ) {
            const option = filteredOptions[highlightedIndex];
            onSelect(String(option.id));
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredOptions, highlightedIndex, onSelect, onClose]);

  return { highlightedIndex };
};
