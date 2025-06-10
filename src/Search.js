import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';


// SearchInput now maintains its own internal input state.
const SearchInput = React.memo(({ onSearch, disabled }) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState("");
  
    const handleChange = (e) => {
      setInputValue(e.target.value);
    };
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onSearch(inputValue);
      }
    };

    const handleClickSend = () => {
        onSearch(inputValue);
    }
  
    const pubChemUrl = "https://pubchem.ncbi.nlm.nih.gov//edit3/index.html";
    
    const handleTooltipClick = () => {
      window.open(pubChemUrl, '_blank', 'noopener,noreferrer');
    };
  
    return (
      <div className="search-bar-container" style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="search-input search-input-full"
          placeholder={t('search.searchPlaceholder')}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button 
          className="search-button"
          onClick={handleClickSend}
          disabled={disabled}
        >
          {t('search.searchButton')}
        </button>
        <span
          className="search-tooltip-marker"
          title={t('search.searchTooltip', { pubChemUrl })}
          style={{ marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
          onClick={handleTooltipClick}
        >
          ?
        </span>
      </div>
    );
});

export default SearchInput;