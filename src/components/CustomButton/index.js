import React, { useEffect, useState } from 'react';
import './CustomButton.less';
import { Button } from '@mui/material';

const STATUS_HIDE_TIME = 3000; // 3 seconds

const CustomButton = ({
  Icon = null,
  onClick,
  color,
  variant,
  loading,
  loadingText,
  disabled = false,
  errorMessage,
  successMessage,
  hideTime = STATUS_HIDE_TIME,
  sideError,
  fullWidth = false,
  style,
  children
}) => {
  const [localStatusMessage, setLocalStatusMessage] = useState(errorMessage);
  const [statusState, setStatusState] = useState('sucess'); // 'error' or 'success'

  useEffect(() => {
    if (errorMessage) {
      setStatusState('error');
      setLocalStatusMessage(errorMessage);
    } else if (successMessage) {
      setStatusState('success');
      setLocalStatusMessage(successMessage);
    }

    setTimeout(() => {
        setStatusState('');
        setLocalStatusMessage('');
    }, hideTime);

  }, [errorMessage, successMessage, hideTime]);

  return (
    <div className={`custom-button-group ${sideError ? 'side' : ''} ${fullWidth ? 'full-width' : ''}`} style={style}>
      <Button
        variant={variant || "contained"}
        color={color || 'primary'}
        onClick={onClick}
        size="small"
        disabled={disabled}
        className='icon-button'
        loading={loading && !disabled}
        loadingPosition='start'
        fullWidth={fullWidth}
        startIcon={
          Icon && <Icon size={18} style={{ margin: 4 }} />
        }>
        {loading && loadingText ? loadingText : children}
      </Button>
      {localStatusMessage && (
        <div className={`status-indicator ${statusState}`}>
          {localStatusMessage}
        </div>
      )}
    </div>
  );
};

export default CustomButton;
