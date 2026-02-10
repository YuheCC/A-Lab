import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useCallback } from 'react';
import MolEditor from '../MolEditor';
import './Search.less';
import { useTranslation } from 'react-i18next';
import benPenSvg from '@/assets/svg/benPen.svg';
import InfoTooltip from '@/components/InfoTooltip';


// SearchInput now maintains its own internal input state.
const SearchInputInner = ({
  onSearch,
  disabled,
  initialValue = "",
  lockInput = false,
  initialEditorOpen,
  lockMolEditorToggle = false,
  allowSubmitWhenLocked = false,
  onLockedClick,
  placeholder,
  showSubmitButton = true,
}, ref) => {
  const { t } = useTranslation();
  const resolvedInitialEditorOpen = initialEditorOpen ?? false;
  const [showMolEditor, setShowMolEditor] = useState(resolvedInitialEditorOpen);
  const [inputValue, setInputValue] = useState(initialValue);
  const resolvedPlaceholder = useMemo(
    () => placeholder ?? t('search.searchPlaceholder'),
    [placeholder, t],
  );

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (lockMolEditorToggle) {
      setShowMolEditor(resolvedInitialEditorOpen);
    }
  }, [lockMolEditorToggle, resolvedInitialEditorOpen]);

  const handleLockedClick = () => {
    if (typeof onLockedClick === 'function') {
      onLockedClick();
    }
  };

  const handleChange = (e) => {
    if (lockInput) {
      handleLockedClick();
      return;
    }
    setInputValue(e.target.value);
  };

  const handleMolChange = (mol) => {
    if (lockInput) return;
    // If the molecule is valid, update the inputValue
    if (mol) {
      setInputValue(mol);
    }
  }

  const isSubmitDisabled = disabled || (lockInput && !allowSubmitWhenLocked);

  const submit = useCallback(() => {
    if (isSubmitDisabled) {
      if (lockInput && typeof onLockedClick === 'function') {
        onLockedClick();
      }
      return;
    }
    onSearch(inputValue);
  }, [isSubmitDisabled, lockInput, onLockedClick, onSearch, inputValue]);

  useImperativeHandle(ref, () => ({
    submit,
    getValue: () => inputValue,
    isSubmitDisabled,
  }), [submit, inputValue, isSubmitDisabled]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  // 使用外部 SVG 资源替代内联 SVG
  const NewPenIcon = () => (
    <img
      src={benPenSvg}
      alt={t('search.drawMolecule', 'Draw molecule')}
      className="icon"
      style={{ width: 32, height: 32 }}
    />
  );

  return (
    <div className={`search-bar-container ${showMolEditor ? 'open' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
      <div className='search-input-container'>
        <InfoTooltip title={t('search.drawMolecule', 'Draw molecule')} placement="top">
          <div
            className='control-icon pen-icon'
            style={{
              marginLeft: '8px',
              cursor: lockMolEditorToggle ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              opacity: lockMolEditorToggle ? 0.5 : 1,
            }}
            onClick={() => {
              if (lockMolEditorToggle) {
                handleLockedClick();
                return;
              }
              setShowMolEditor(!showMolEditor);
            }}
          >
            <NewPenIcon />
          </div>
        </InfoTooltip>
        <input
          type="text"
          className="search-input"
          placeholder={resolvedPlaceholder}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={lockInput}
          disabled={disabled}
          onClick={() => {
            if (lockInput) {
              handleLockedClick();
            }
          }}
          onFocus={(e) => {
            if (lockInput) {
              e.target.blur();
              handleLockedClick();
            }
          }}
          onMouseDown={(e) => {
            if (lockInput) {
              e.preventDefault();
              handleLockedClick();
            }
          }}
          style={{
            cursor: lockInput ? 'not-allowed' : 'text',
            backgroundColor: lockInput ? '#f0f2f5' : undefined,
          }}
        />
        {showSubmitButton && (
          <button
            className="search-button"
            onClick={submit}
            disabled={isSubmitDisabled}
          >
            {t('search.searchButton')}
          </button>
        )}
      </div>
      {showMolEditor && !lockMolEditorToggle && (
        <MolEditor
          onMolChange={handleMolChange}
          getSmilesForImport={() => inputValue}
          style={{
            marginTop: 5,
            border: 'none',
            boxShadow: 'none',
          }}
        />
      )} 
    </div>
  );
};

const SearchInput = React.memo(forwardRef(SearchInputInner));

export default SearchInput;
