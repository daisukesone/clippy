import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useCleppy } from '../context/CleppyContext';

interface KeyboardShortcutOptions {
  onHistoryOpen?: () => void;
  onHistoryClose?: () => void;
  onSelectUp?: () => void;
  onSelectDown?: () => void;
  onConfirm?: () => void;
}

export function useKeyboardShortcut(options: KeyboardShortcutOptions = {}) {
  const { state, toggleHistoryOverlay, setHistoryOverlay } = useCleppy();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!state.settings.shortcutEnabled) return;

      // Cmd+Shift+V (macOS) / Ctrl+Shift+V (Windows/Linux) - toggle history
      if (
        event.key === 'v' &&
        event.shiftKey &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        if (state.isHistoryOverlayVisible) {
          setHistoryOverlay(false);
          options.onHistoryClose?.();
        } else {
          toggleHistoryOverlay();
          options.onHistoryOpen?.();
        }
        return;
      }

      // History overlay navigation
      if (!state.isHistoryOverlayVisible) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          options.onSelectUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          options.onSelectDown?.();
          break;
        case 'Enter':
          event.preventDefault();
          options.onConfirm?.();
          break;
        case 'Escape':
          event.preventDefault();
          setHistoryOverlay(false);
          options.onHistoryClose?.();
          break;
      }
    },
    [
      state.settings.shortcutEnabled,
      state.isHistoryOverlayVisible,
      toggleHistoryOverlay,
      setHistoryOverlay,
      options,
    ]
  );

  useEffect(() => {
    // Keyboard shortcuts only work on web platform
    if (Platform.OS !== 'web') return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
