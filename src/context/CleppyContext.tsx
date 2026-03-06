import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  CleppyState,
  ClipboardEntry,
  CleppyMood,
  ChatMessage,
  UserSettings,
} from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  clipboardMonitoring: true,
  aiAnalysis: true,
  maxHistorySize: 100,
  theme: 'dark',
  shortcutEnabled: true,
};

const initialState: CleppyState = {
  clipboardHistory: [],
  mood: { expression: 'idle' },
  chatMessages: [],
  settings: DEFAULT_SETTINGS,
  isHistoryOverlayVisible: false,
  isAuthenticated: false,
  apiKey: null,
};

type Action =
  | { type: 'ADD_CLIPBOARD_ENTRY'; payload: ClipboardEntry }
  | { type: 'REMOVE_CLIPBOARD_ENTRY'; payload: string }
  | { type: 'TOGGLE_PIN'; payload: string }
  | { type: 'SET_MOOD'; payload: CleppyMood }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'TOGGLE_HISTORY_OVERLAY' }
  | { type: 'SET_HISTORY_OVERLAY'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_API_KEY'; payload: string | null };

function cleppyReducer(state: CleppyState, action: Action): CleppyState {
  switch (action.type) {
    case 'ADD_CLIPBOARD_ENTRY': {
      const history = [action.payload, ...state.clipboardHistory];
      const maxSize = state.settings.maxHistorySize;
      return {
        ...state,
        clipboardHistory: history.slice(0, maxSize),
      };
    }
    case 'REMOVE_CLIPBOARD_ENTRY':
      return {
        ...state,
        clipboardHistory: state.clipboardHistory.filter(
          (entry) => entry.id !== action.payload
        ),
      };
    case 'TOGGLE_PIN':
      return {
        ...state,
        clipboardHistory: state.clipboardHistory.map((entry) =>
          entry.id === action.payload
            ? { ...entry, pinned: !entry.pinned }
            : entry
        ),
      };
    case 'SET_MOOD':
      return { ...state, mood: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };
    case 'CLEAR_CHAT':
      return { ...state, chatMessages: [] };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'TOGGLE_HISTORY_OVERLAY':
      return {
        ...state,
        isHistoryOverlayVisible: !state.isHistoryOverlayVisible,
      };
    case 'SET_HISTORY_OVERLAY':
      return { ...state, isHistoryOverlayVisible: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'CLEAR_HISTORY':
      return {
        ...state,
        clipboardHistory: state.clipboardHistory.filter((e) => e.pinned),
      };
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    default:
      return state;
  }
}

interface CleppyContextValue {
  state: CleppyState;
  dispatch: React.Dispatch<Action>;
  addClipboardEntry: (entry: ClipboardEntry) => void;
  removeClipboardEntry: (id: string) => void;
  togglePin: (id: string) => void;
  setMood: (mood: CleppyMood) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleHistoryOverlay: () => void;
  setHistoryOverlay: (visible: boolean) => void;
  setAuthenticated: (auth: boolean) => void;
  clearHistory: () => void;
  setApiKey: (key: string | null) => void;
}

const CleppyContext = createContext<CleppyContextValue | undefined>(undefined);

export function CleppyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cleppyReducer, initialState);

  const value: CleppyContextValue = {
    state,
    dispatch,
    addClipboardEntry: (entry) =>
      dispatch({ type: 'ADD_CLIPBOARD_ENTRY', payload: entry }),
    removeClipboardEntry: (id) =>
      dispatch({ type: 'REMOVE_CLIPBOARD_ENTRY', payload: id }),
    togglePin: (id) => dispatch({ type: 'TOGGLE_PIN', payload: id }),
    setMood: (mood) => dispatch({ type: 'SET_MOOD', payload: mood }),
    addChatMessage: (message) =>
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message }),
    clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),
    updateSettings: (settings) =>
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    toggleHistoryOverlay: () => dispatch({ type: 'TOGGLE_HISTORY_OVERLAY' }),
    setHistoryOverlay: (visible) =>
      dispatch({ type: 'SET_HISTORY_OVERLAY', payload: visible }),
    setAuthenticated: (auth) =>
      dispatch({ type: 'SET_AUTHENTICATED', payload: auth }),
    clearHistory: () => dispatch({ type: 'CLEAR_HISTORY' }),
    setApiKey: (key) => dispatch({ type: 'SET_API_KEY', payload: key }),
  };

  return (
    <CleppyContext.Provider value={value}>{children}</CleppyContext.Provider>
  );
}

export function useCleppy(): CleppyContextValue {
  const context = useContext(CleppyContext);
  if (!context) {
    throw new Error('useCleppy must be used within a CleppyProvider');
  }
  return context;
}
