import { Tooltip } from '@mui/material';
import { CircleHelp, Pen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import MolEditor from '../MolEditor';
import './Search.css';
import { useTranslation } from 'react-i18next';


// SearchInput now maintains its own internal input state.
const SearchInput = React.memo(({ onSearch, disabled }) => {
  const { t } = useTranslation();
  const [showMolEditor, setShowMolEditor] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleMolChange = (mol) => {
    // If the molecule is valid, update the inputValue
    if (mol) {
      setInputValue(mol);
    }
  }

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

  // 定义一个React组件来渲染SVG
  const NewPenIcon = () => (
    <svg 
      className="icon" 
      viewBox="0 0 1024 1024" 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18"
    >
              <path 
          d="M264.192 785.521778c18.147556 0 36.238222-6.257778 54.385778-18.830222h6.030222L155.363556 590.506667v6.257777c-12.060444 18.887111-18.090667 37.774222-18.090667 56.604445L76.8 848.440889l187.392-62.919111zM868.636444 81.066667l-54.442666-56.661334a74.524444 74.524444 0 0 0-108.771556 0l-54.385778 56.661334 163.157334 169.813333 54.442666-56.604444a82.033778 82.033778 0 0 0 0-113.208889z m-108.828444 226.417777L596.650667 137.671111 215.836444 533.902222l163.157334 169.870222 380.814222-396.288zM28.444444 905.045333h967.111112v62.919111H28.444444v-62.919111z" 
          fill="#FFD700"
        />
    </svg>
  );

  return (
    <div className={`search-bar-container ${showMolEditor ? 'open' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
      <div className='search-input-container'>
        <Tooltip title={t('search.drawMolecule', 'Draw molecule')} placement="top">
          <div 
            className='control-icon' 
            style={{ marginLeft: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
            onClick={() => {
              setShowMolEditor(!showMolEditor);
            }}
          >
            <NewPenIcon />
          </div>
        </Tooltip>
        <input
          type="text"
          className="search-input"
          placeholder={t('search.searchPlaceholder')}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Tooltip
          title={<>
            <div style={{ whiteSpace: 'pre-line', width: '300px' }} dangerouslySetInnerHTML={{ __html: t('search.searchTooltip', { pubChemUrl }) }} />
          </>}
        >
          <CircleHelp size={18} style={{
            marginLeft: '8px',
            marginRight: '8px',
            color: '#999',
            cursor: 'pointer',
          }}/>
        </Tooltip>
        <button
          className="search-button"
          onClick={handleClickSend}
          disabled={disabled}
        >
          {t('search.searchButton')}
        </button>
      </div>
      {showMolEditor && <MolEditor onMolChange={handleMolChange} style={{
        marginTop: 5,
        border: 'none',
        boxShadow: 'none',
      }}/>}
    </div>
  );
});

export default SearchInput;