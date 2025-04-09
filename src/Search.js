import React, { useState, useEffect, useRef, useMemo } from 'react';

const API_URL = 'http://0.0.0.0:8000'; // Define your API URL as needed

// SearchInput now maintains its own internal input state.
const SearchInput = React.memo(({ onSearch, disabled }) => {
    const [inputValue, setInputValue] = useState("");
  
    const handleChange = (e) => {
      setInputValue(e.target.value);
    };
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onSearch(inputValue);
        // Optionally clear the input after sending
        setInputValue("");
      }
    };

    const handleClickSend = () => {
        onSearch(inputValue);
        // Optionally clear the input after sending
        setInputValue("");
    }
  
    return (
        <div className="search-bar-container">
            <input
                type="text"
                className="search-input search-input-full"
                placeholder="Enter SMILES string..."
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
      </div>
    );
});

export default SearchInput;