import Box from '@mui/material/Box';
import MuiSlider from '@mui/material/Slider';

const Slider = ({ property, value, min, max, onChange, label, active }) => {
  const handleChange = (event, newValue) => {
    // This updates temporary state during dragging, not applying the filter yet
    onChange(property, newValue, false);
  };

  const handleChangeCommitted = (event, newValue) => {
    // This applies the filter after dragging is complete
    onChange(property, newValue, true);
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(4);
    }
    return value;
  };

  return (
    <div className={`slider-container ${active ? 'active-filter' : 'inactive-filter'}`}>
      <div className="slider-header">
        <span className="slider-label">
          {label}
          {label === "HOMO (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`HOMO / LUMO: These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
            >
              ?
            </span>
          )}
          {label === "LUMO (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`HOMO / LUMO: These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
            >
              ?
            </span>
          )}
          {label === "Max ESP (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`ESP Min / Max: Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
            >
              ?
            </span>
          )}
          {label === "Min ESP (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`ESP Min / Max: Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
            >
              ?
            </span>
          )}
        </span>
        <span className="slider-value">
          {active
            ? `${formatValue(value[0])} - ${formatValue(value[1])}`
            : "Off"}
        </span>
      </div>
      <Box sx={{ width: '100%', padding: '5px 0' }}>
        <MuiSlider
          size="small"
          value={value}
          min={min}
          max={max}
          step={(max - min) / 100}
          onChange={handleChange}
          onChangeCommitted={handleChangeCommitted}
          valueLabelDisplay="auto"
          disableSwap
          sx={{
            color: '#0080ff',
            '& .MuiSlider-thumb': {
              backgroundColor: active ? '#0080ff' : '#a0a0a0',
            },
            '& .MuiSlider-track': {
              backgroundColor: active ? '#0080ff' : '#a0a0a0',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e0e0e0',
            }
          }}
        />
      </Box>
    </div>
  );
};

export default Slider;