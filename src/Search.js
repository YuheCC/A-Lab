import React, { useState, useEffect, useRef, useMemo } from 'react';


// SearchInput now maintains its own internal input state.
const SearchInput = React.memo(({ onSearch, disabled }) => {
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
          placeholder="Enter SMILES string, molecule name, or query"
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
          Search
        </button>
        <span
          className="search-tooltip-marker"
          title={`Valid queries can search over any numerical properties of molecules. For example:
 - "Find all molecules with HOMO at most -8"
 - "Find all molecules with LUMO at least -2 and molecular weight at most 200"
For more open-ended queries, use Ask.

To draw and look up SMILES strings, please click this icon or visit ${pubChemUrl}`}
          style={{ marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
          onClick={handleTooltipClick}
        >
          ?
        </span>
      </div>
    );
});

export default SearchInput;