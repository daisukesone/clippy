import { useEffect, useRef, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useCleppy } from '../context/CleppyContext';
import { analyzeClipboardContent } from '../services/claudeService';
import { ClipboardEntry } from '../types';

const POLL_INTERVAL = 1500;

export function useClipboardHistory() {
  const { state, addClipboardEntry, setMood } = useCleppy();
  const lastContentRef = useRef<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const processNewContent = useCallback(
    async (content: string) => {
      if (
        !content ||
        content === lastContentRef.current ||
        content.trim().length === 0
      ) {
        return;
      }

      lastContentRef.current = content;

      const entry: ClipboardEntry = {
        id: Date.now().toString(),
        content,
        timestamp: Date.now(),
        type: 'text',
      };

      if (state.settings.aiAnalysis) {
        setMood({ expression: 'thinking', message: '分析中...' });
        try {
          const analysis = await analyzeClipboardContent(content);
          entry.type = analysis.type;
          entry.aiSummary = analysis.summary;
          entry.tags = analysis.tags;
          setMood({
            expression: 'excited',
            message: analysis.summary,
          });
        } catch {
          setMood({ expression: 'idle' });
        }
      } else {
        entry.type = detectType(content);
      }

      addClipboardEntry(entry);

      setTimeout(() => setMood({ expression: 'idle' }), 3000);
    },
    [state.settings.aiAnalysis, addClipboardEntry, setMood]
  );

  useEffect(() => {
    if (!state.settings.clipboardMonitoring) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const content = await Clipboard.getStringAsync();
        await processNewContent(content);
      } catch {
        // Clipboard access may fail silently
      }
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.settings.clipboardMonitoring, processNewContent]);

  const copyToClipboard = useCallback(async (text: string) => {
    lastContentRef.current = text;
    await Clipboard.setStringAsync(text);
  }, []);

  return {
    history: state.clipboardHistory,
    copyToClipboard,
  };
}

function detectType(content: string): ClipboardEntry['type'] {
  const urlPattern = /^https?:\/\//i;
  if (urlPattern.test(content.trim())) return 'url';

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailPattern.test(content.trim())) return 'email';

  const codeIndicators = [
    /[{}\[\]];?\s*$/m,
    /^(import|export|const|let|var|function|class|def|pub fn)\s/m,
    /=>/,
    /^\s*(if|for|while)\s*\(/m,
  ];
  if (codeIndicators.some((pattern) => pattern.test(content))) return 'code';

  return 'text';
}
