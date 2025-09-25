import InfoTooltip from '@/components/InfoTooltip';
import { CircleHelp, Pen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import MolEditor from '../MolEditor';
import './Search.css';
import { useTranslation } from 'react-i18next';
import benPenSvg from '@/assets/svg/benPen.svg';


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
            style={{ marginLeft: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => {
              setShowMolEditor(!showMolEditor);
            }}
          >
            <NewPenIcon />
          </div>
        </InfoTooltip>
        <input
          type="text"
          className="search-input"
          placeholder={t('search.searchPlaceholder')}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <InfoTooltip
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
        </InfoTooltip>
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