import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ModelSelectProps } from './types';
import { useSelection } from './hooks/useSelection';
import { useSearch } from './hooks/useSearch';
import { useRequest } from './hooks/useRequest';
import { useKeyboard } from './hooks/useKeyboard';
import { useGrouping } from './hooks/useGrouping';
import SearchInput from './components/SearchInput';
import DropdownTable from './components/DropdownTable';
import './index.less';

const ModelSelect: React.FC<ModelSelectProps> = ({
  mode = 'single',
  value,
  onChange,
  options,
  groups,
  request,
  groupBy,
  groupByLabel,
  ungroupedLabel = '未分组',
  columns = [],
  defaultColumns,
  searchable = false,
  searchPlaceholder,
  filter,
  searchOnServer,
  pageSize = 20,
  placeholder,
  disabled = false,
  loading: externalLoading,
  className = '',
  fieldNames = { label: 'name', value: 'id' },
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  }>({ top: 0, left: 0, width: 0, placement: 'bottom' });
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 国际化占位符
  const actualPlaceholder = placeholder || t('common.modelSelect.placeholder');
  const actualSearchPlaceholder =
    searchPlaceholder || t('common.modelSelect.searchPlaceholder');

  // 使用 request Hook 获取数据
  const { data, loading, error } = useRequest(
    request,
    options,
    groups,
    searchable ? undefined : ''
  );

  // 自动分组逻辑
  const autoGroups = useGrouping(
    data.options,
    groupBy,
    groupByLabel,
    ungroupedLabel
  );

  // 确定最终使用的分组数据
  // 优先级：手动 groups > 自动 autoGroups
  const finalGroups = data.groups || autoGroups;

  // 处理列配置
  const processedColumns = useMemo(() => {
    if (columns.length > 0) {
      return columns;
    }

    const allOptions = finalGroups
      ? finalGroups.flatMap((g) => g.options)
      : data.options;

    if (defaultColumns && defaultColumns.length > 0 && allOptions.length > 0) {
      return defaultColumns.map((key) => ({
        key,
        title:
          key.charAt(0).toUpperCase() +
          key.slice(1).replace(/([A-Z])/g, ' $1'),
        width: 'auto',
      }));
    }

    if (allOptions.length > 0) {
      const firstOption = allOptions[0];
      return Object.keys(firstOption)
        .filter((key) => key !== 'id')
        .map((key) => ({
          key,
          title:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, ' $1'),
          width: 'auto',
        }));
    }

    return [];
  }, [columns, defaultColumns, data, finalGroups]);

  // 搜索功能
  const { searchValue, setSearchValue, filteredOptions } = useSearch(
    data.options,
    processedColumns,
    filter,
    !!request
  );

  // 选择逻辑
  const { handleSelect, isSelected } = useSelection(
    mode,
    value,
    onChange,
    () => setIsOpen(false)
  );

  // 键盘导航
  const { highlightedIndex } = useKeyboard(
    isOpen,
    filteredOptions,
    handleSelect,
    () => setIsOpen(false)
  );

  // 更新下拉框位置
  const updateDropdownPosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const gap = 4; // 间距

    // 获取下拉框的实际高度，如果还未渲染则使用估算值
    let dropdownHeight = 400; // 默认最大高度
    if (dropdownRef.current) {
      dropdownHeight = dropdownRef.current.offsetHeight;
    }

    // 计算上方和下方的可用空间
    const spaceBelow = viewportHeight - triggerRect.bottom - gap;
    const spaceAbove = triggerRect.top - gap;

    // 决定显示位置：优先显示在下方，除非下方空间不足且上方空间更多
    let placement: 'bottom' | 'top' = 'bottom';
    let top = triggerRect.bottom + gap;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      // 下方空间不足，且上方空间更多，则显示在上方
      placement = 'top';
      top = triggerRect.top - gap;
    }

    // 处理左右边界
    let left = triggerRect.left;
    const dropdownWidth = triggerRect.width;

    // 确保不超出右边界
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 10; // 10px 边距
    }

    // 确保不超出左边界
    if (left < 10) {
      left = 10;
    }

    setDropdownPosition({
      top,
      left,
      width: triggerRect.width,
      placement,
    });
  };

  // 打开时更新位置
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      // 在下一帧再次更新，此时下拉框已经渲染完成，可以获取实际高度
      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
    }
  }, [isOpen]);

  // 监听滚动和窗口尺寸变化
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      updateDropdownPosition();
    };

    // 监听滚动（包括所有父元素）
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
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

  // 获取显示值
  const getDisplayValue = () => {
    if (!value) return actualPlaceholder;

    const labelField = fieldNames.label || 'name';
    const allOptions = finalGroups
      ? finalGroups.flatMap((g) => g.options)
      : data.options;

    if (mode === 'single') {
      const selectedOption = allOptions.find(
        (opt) => String(opt.id) === String(value)
      );
      return selectedOption ? selectedOption[labelField] : value;
    } else {
      const selectedCount = Array.isArray(value) ? value.length : 0;
      return selectedCount > 0
        ? t('common.modelSelect.selected', { count: selectedCount })
        : actualPlaceholder;
    }
  };

  const isLoading = loading || externalLoading;

  // 下拉框内容
  const renderDropdown = () => {
    if (!isOpen) return null;

    const { top, left, width, placement } = dropdownPosition;

    // 根据 placement 调整样式
    const dropdownStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${left}px`,
      width: `${width}px`,
    };

    if (placement === 'top') {
      // 显示在上方时，使用 bottom 定位
      dropdownStyle.bottom = `${window.innerHeight - top}px`;
      dropdownStyle.transformOrigin = 'bottom center';
    } else {
      // 显示在下方时，使用 top 定位
      dropdownStyle.top = `${top}px`;
      dropdownStyle.transformOrigin = 'top center';
    }

    return createPortal(
      <div
        ref={dropdownRef}
        className={`model-select__dropdown model-select__dropdown--portal model-select__dropdown--${placement}`}
        style={dropdownStyle}
      >
        {searchable && (
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder={actualSearchPlaceholder}
          />
        )}

        {isLoading ? (
          <div className="model-select__empty">
            {t('common.modelSelect.loading')}
          </div>
        ) : error ? (
          <div className="model-select__empty">
            {t('common.modelSelect.loadError')}
          </div>
        ) : filteredOptions.length === 0 && !finalGroups ? (
          <div className="model-select__empty">
            {t('common.modelSelect.noData')}
          </div>
        ) : (
          <DropdownTable
            columns={processedColumns}
            options={finalGroups ? undefined : filteredOptions}
            groups={finalGroups}
            onSelect={handleSelect}
            isSelected={isSelected}
            mode={mode}
            highlightedIndex={highlightedIndex}
            pageSize={pageSize}
          />
        )}
      </div>,
      document.body
    );
  };

  return (
    <div
      className={`model-select ${className} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      ref={selectRef}
    >
      <div
        className={`model-select__trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        ref={triggerRef}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
      >
        <span className="model-select__value">{getDisplayValue()}</span>
        <span className="model-select__arrow">▼</span>
      </div>

      {renderDropdown()}
    </div>
  );
};

export default ModelSelect;
