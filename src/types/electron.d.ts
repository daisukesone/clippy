/**
 * Type declarations for the Electron bridge API
 * exposed via preload.ts contextBridge.
 *
 * Available on `window.cleppyBridge` when running in Electron.
 */

interface CleppyBridge {
  getClipboardHistory: () => Promise<string[]>;
  writeClipboard: (text: string) => Promise<void>;
  hideWindow: () => Promise<void>;
  onNewClipboardContent: (callback: (content: string) => void) => () => void;
  onToggleHistoryOverlay: (callback: () => void) => () => void;
  onHistoryCleared: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    cleppyBridge?: CleppyBridge;
  }
}

export {};
