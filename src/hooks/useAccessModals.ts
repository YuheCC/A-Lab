import { useCallback, useContext } from 'react';
import { useAuthStore } from '@/models/useAuth';
import { useLoginModal } from '@/components/LoginModal/hooks';
import { PricingContext } from '@/layouts';

export const useAccessModals = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const pricingContext = useContext(PricingContext);

  return useCallback((requiredPermission?: string | null) => {
    if (!isAuthenticated) {
      openLoginModal?.();
      return;
    }

    pricingContext?.setPermission?.(requiredPermission ?? null);
    pricingContext?.setShowPricingOverlay?.(true);
  }, [isAuthenticated, openLoginModal, pricingContext]);
};

export default useAccessModals;
