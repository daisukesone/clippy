import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CleppyProvider, useCleppy } from '../../context/CleppyContext';
import { ClipboardEntry, ChatMessage } from '../../types';

function wrapper({ children }: { children: React.ReactNode }) {
  return <CleppyProvider>{children}</CleppyProvider>;
}

describe('CleppyContext', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });
    expect(result.current.state.clipboardHistory).toEqual([]);
    expect(result.current.state.mood.expression).toBe('idle');
    expect(result.current.state.chatMessages).toEqual([]);
    expect(result.current.state.isHistoryOverlayVisible).toBe(false);
    expect(result.current.state.isAuthenticated).toBe(false);
  });

  it('adds clipboard entry', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    const entry: ClipboardEntry = {
      id: '1',
      content: 'test content',
      timestamp: Date.now(),
      type: 'text',
    };

    act(() => {
      result.current.addClipboardEntry(entry);
    });

    expect(result.current.state.clipboardHistory).toHaveLength(1);
    expect(result.current.state.clipboardHistory[0].content).toBe(
      'test content'
    );
  });

  it('removes clipboard entry', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    const entry: ClipboardEntry = {
      id: '1',
      content: 'test',
      timestamp: Date.now(),
      type: 'text',
    };

    act(() => {
      result.current.addClipboardEntry(entry);
    });
    act(() => {
      result.current.removeClipboardEntry('1');
    });

    expect(result.current.state.clipboardHistory).toHaveLength(0);
  });

  it('toggles pin on entry', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    const entry: ClipboardEntry = {
      id: '1',
      content: 'test',
      timestamp: Date.now(),
      type: 'text',
    };

    act(() => {
      result.current.addClipboardEntry(entry);
    });
    act(() => {
      result.current.togglePin('1');
    });

    expect(result.current.state.clipboardHistory[0].pinned).toBe(true);

    act(() => {
      result.current.togglePin('1');
    });

    expect(result.current.state.clipboardHistory[0].pinned).toBe(false);
  });

  it('sets mood', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.setMood({ expression: 'thinking', message: '考え中...' });
    });

    expect(result.current.state.mood.expression).toBe('thinking');
    expect(result.current.state.mood.message).toBe('考え中...');
  });

  it('adds chat messages', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    const message: ChatMessage = {
      id: '1',
      role: 'user',
      content: 'こんにちは',
      timestamp: Date.now(),
    };

    act(() => {
      result.current.addChatMessage(message);
    });

    expect(result.current.state.chatMessages).toHaveLength(1);
    expect(result.current.state.chatMessages[0].content).toBe('こんにちは');
  });

  it('clears chat', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.addChatMessage({
        id: '1',
        role: 'user',
        content: 'test',
        timestamp: Date.now(),
      });
    });
    act(() => {
      result.current.clearChat();
    });

    expect(result.current.state.chatMessages).toHaveLength(0);
  });

  it('updates settings', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.updateSettings({ aiAnalysis: false, maxHistorySize: 50 });
    });

    expect(result.current.state.settings.aiAnalysis).toBe(false);
    expect(result.current.state.settings.maxHistorySize).toBe(50);
    // Other settings should remain unchanged
    expect(result.current.state.settings.clipboardMonitoring).toBe(true);
  });

  it('toggles history overlay', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.toggleHistoryOverlay();
    });

    expect(result.current.state.isHistoryOverlayVisible).toBe(true);

    act(() => {
      result.current.toggleHistoryOverlay();
    });

    expect(result.current.state.isHistoryOverlayVisible).toBe(false);
  });

  it('sets history overlay visibility directly', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.setHistoryOverlay(true);
    });

    expect(result.current.state.isHistoryOverlayVisible).toBe(true);

    act(() => {
      result.current.setHistoryOverlay(false);
    });

    expect(result.current.state.isHistoryOverlayVisible).toBe(false);
  });

  it('sets authenticated state', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.setAuthenticated(true);
    });

    expect(result.current.state.isAuthenticated).toBe(true);
  });

  it('clears history but keeps pinned entries', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.addClipboardEntry({
        id: '1',
        content: 'pinned',
        timestamp: Date.now(),
        type: 'text',
        pinned: true,
      });
    });
    act(() => {
      result.current.addClipboardEntry({
        id: '2',
        content: 'not pinned',
        timestamp: Date.now(),
        type: 'text',
      });
    });
    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.state.clipboardHistory).toHaveLength(1);
    expect(result.current.state.clipboardHistory[0].id).toBe('1');
  });

  it('respects maxHistorySize', () => {
    const { result } = renderHook(() => useCleppy(), { wrapper });

    act(() => {
      result.current.updateSettings({ maxHistorySize: 3 });
    });

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.addClipboardEntry({
          id: String(i),
          content: `item ${i}`,
          timestamp: Date.now(),
          type: 'text',
        });
      });
    }

    expect(result.current.state.clipboardHistory).toHaveLength(3);
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useCleppy());
    }).toThrow('useCleppy must be used within a CleppyProvider');
  });
});
