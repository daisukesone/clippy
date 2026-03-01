import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('cleppyBridge', {
  // Clipboard operations
  getClipboardHistory: (): Promise<string[]> =>
    ipcRenderer.invoke('get-clipboard-history'),
  writeClipboard: (text: string): Promise<void> =>
    ipcRenderer.invoke('write-clipboard', text),

  // Window operations
  hideWindow: (): Promise<void> => ipcRenderer.invoke('hide-window'),

  // Event listeners
  onNewClipboardContent: (callback: (content: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, content: string) =>
      callback(content);
    ipcRenderer.on('clipboard-new-content', handler);
    return () => ipcRenderer.removeListener('clipboard-new-content', handler);
  },

  onToggleHistoryOverlay: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('toggle-history-overlay', handler);
    return () =>
      ipcRenderer.removeListener('toggle-history-overlay', handler);
  },

  onHistoryCleared: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('clipboard-history-cleared', handler);
    return () =>
      ipcRenderer.removeListener('clipboard-history-cleared', handler);
  },
});
