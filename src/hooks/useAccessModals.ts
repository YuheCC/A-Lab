import { useCallback, useContext } from 'react';
import { useAuthStore } from '@/models/useAuth';
import { useLoginModal } from '@/components/LoginModal/hooks';
import { PricingContext } from '@/layouts';

const BASIC_TIERS = new Set(['common']);

export const useAccessModals = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userPermissions = useAuthStore((state) => state.userPermissions);
  const { openLoginModal } = useLoginModal();
  const pricingContext = useContext(PricingContext);

  return useCallback(() => {
    if (!isAuthenticated) {
      openLoginModal?.();
      return;
    }

    if (userPermissions && BASIC_TIERS.has(userPermissions)) {
      pricingContext?.setPermission?.(userPermissions);
      pricingContext?.setShowPricingOverlay?.(true);
    }
  }, [isAuthenticated, userPermissions, openLoginModal, pricingContext]);
};

export default useAccessModals;
