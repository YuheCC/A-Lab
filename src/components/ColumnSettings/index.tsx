import React, { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import './index.less';

export interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
  disabled?: boolean; // 某些列不允许隐藏
}

interface ColumnSettingsProps {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
  storageKey?: string; // localStorage key
}

const ColumnSettings: React.FC<ColumnSettingsProps> = ({
  columns,
  onChange,
  storageKey,
}) => {
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 加载配置
  useEffect(() => {
    if (storageKey) {
      const savedConfig = localStorage.getItem(storageKey);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          const updatedColumns = columns.map(col => {
            const saved = parsed.find((c: ColumnConfig) => c.key === col.key);
            return saved ? { ...col, visible: saved.visible } : col;
          });
          onChange(updatedColumns);
        } catch (e) {
          console.error('Failed to parse column config from localStorage:', e);
        }
      }
    }
  }, [storageKey]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);

  const handleToggle = (key: string) => {
    const updatedColumns = columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onChange(updatedColumns);

    // 保存到 localStorage
    if (storageKey) {
      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedColumns.map(c => ({ key: c.key, visible: c.visible })))
      );
    }
  };

  const handleSelectAll = () => {
    const allVisible = columns.every(col => col.visible);
    const updatedColumns = columns.map(col => ({ ...col, visible: !allVisible }));
    onChange(updatedColumns);

    // 保存到 localStorage
    if (storageKey) {
      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedColumns.map(c => ({ key: c.key, visible: c.visible })))
      );
    }
  };

  const handleReset = () => {
    const resetColumns = columns.map(col => ({ ...col, visible: true }));
    onChange(resetColumns);

    // 清除 localStorage
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const visibleCount = columns.filter(col => col.visible).length;
  const allVisible = columns.every(col => col.visible);

  return (
    <div className="column-settings" ref={dropdownRef}>
      <button
        className="column-settings-trigger"
        onClick={() => setVisible(!visible)}
        aria-label="列设置"
      >
        <Settings size={16} />
      </button>

      {visible && (
        <div className="column-settings-dropdown">
          <div className="column-settings-header">
            <span className="column-settings-title">列展示</span>
            <span className="column-settings-count">
              {visibleCount}/{columns.length}
            </span>
          </div>

          <div className="column-settings-actions">
            <button
              className="column-settings-action-btn"
              onClick={handleSelectAll}
            >
              {allVisible ? '取消全选' : '全选'}
            </button>
            <button
              className="column-settings-action-btn"
              onClick={handleReset}
            >
              重置
            </button>
          </div>

          <div className="column-settings-list">
            {columns.map(col => (
              <label
                key={col.key}
                className={`column-settings-item ${col.disabled ? 'disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  disabled={col.disabled}
                  onChange={() => !col.disabled && handleToggle(col.key)}
                />
                <span className="column-settings-item-checkbox"></span>
                <span className="column-settings-item-label">{col.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnSettings;
