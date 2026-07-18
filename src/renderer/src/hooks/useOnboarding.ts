import { useState, useCallback, useEffect } from 'react';

const ONBOARDING_KEY = 'morphfinder:has_seen_onboarding_v1';

export interface UseOnboardingReturn {
  isOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  resetOnboarding: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(ONBOARDING_KEY);
      if (!hasSeen) {
        setIsOpen(true);
      }
    } catch {
      // Fallback if localStorage unavailable
    }
  }, []);

  const openOnboarding = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Fallback
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
    } catch {
      // Fallback
    }
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    openOnboarding,
    closeOnboarding,
    resetOnboarding,
  };
}
