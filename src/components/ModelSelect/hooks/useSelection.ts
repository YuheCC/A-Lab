import { useCallback } from 'react';

/**
 * 选择逻辑 Hook
 * @param mode 选择模式（单选/多选）
 * @param value 当前值
 * @param onChange 值变化回调
 * @param onClose 关闭回调
 */
export const useSelection = (
  mode: 'single' | 'multiple',
  value: string | string[] | undefined,
  onChange?: (value: string | string[]) => void,
  onClose?: () => void
) => {
  const handleSelect = useCallback(
    (optionId: string) => {
      if (mode === 'single') {
        onChange?.(optionId);
        onClose?.(); // 单选后自动关闭
      } else {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionId)
          ? currentValues.filter((v) => v !== optionId)
          : [...currentValues, optionId];
        onChange?.(newValues);
      }
    },
    [mode, value, onChange, onClose]
  );

  const isSelected = useCallback(
    (optionId: string) => {
      if (mode === 'single') {
        return value === optionId;
      }
      return Array.isArray(value) && value.includes(optionId);
    },
    [mode, value]
  );

  return { handleSelect, isSelected };
};
