import { create } from 'zustand';

type CameraGuideState = {
  isVisible: boolean;
  navigateNext?: () => void;
  open: (navigateNext: () => void) => void;
  proceed: () => void;
};

export const useCameraGuideStore = create<CameraGuideState>((set, get) => ({
  isVisible: false,
  navigateNext: undefined,
  open: (navigateNext) => set({ isVisible: true, navigateNext }),
  proceed: () => {
    const next = get().navigateNext;
    set({ isVisible: false, navigateNext: undefined });
    // Navigate after closing to honor the requirement.
    next?.();
  },
}));