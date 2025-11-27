import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const selectRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      className={`model-select ${className} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      ref={selectRef}
    >
      <div
        className={`model-select__trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
      >
        <span className="model-select__value">{getDisplayValue()}</span>
        <span className="model-select__arrow">▼</span>
      </div>

      {isOpen && (
        <div className="model-select__dropdown">
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
        </div>
      )}
    </div>
  );
};

export default ModelSelect;
