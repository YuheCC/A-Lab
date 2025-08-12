import { useState } from 'react';

interface UsePricingOverlayReturn {
  visible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const usePricingOverlay = (): UsePricingOverlayReturn => {
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);
  const toggle = () => setVisible(!visible);

  return {
    visible,
    open,
    close,
    toggle,
  };
}; 