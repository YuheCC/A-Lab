import { Tooltip } from '@mui/material';
import { CircleHelp, Pen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import MolEditor from '../MolEditor';
import './Search.css';


// SearchInput now maintains its own internal input state.
const SearchInput = React.memo(({ onSearch, disabled }) => {
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

  return (
    <div className={`search-bar-container ${showMolEditor ? 'open' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
      <div className='search-input-container'>
        <Tooltip title="Draw molecule" placement="top">
          <Pen className='control-icon' size={18} style={{ marginLeft: '8px' }} onClick={() => {
            setShowMolEditor(!showMolEditor);
          }} />
        </Tooltip>
        <input
          type="text"
          className="search-input"
          placeholder="Enter SMILES string, molecule name, or query"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Tooltip
          title={<>
            <p>Valid queries can search over any numerical properties of molecules. For example:</p>
            <p>- "Find all molecules with HOMO at most -8"</p>
            <p>- "Find all molecules with LUMO at least -2 and molecular weight at most 200"</p>
            <p>For more open-ended queries, use Ask.</p>
          </>}>
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
          Search
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