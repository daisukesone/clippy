export interface ClipboardEntry {
  id: string;
  content: string;
  timestamp: number;
  type: 'text' | 'url' | 'code' | 'email' | 'other';
  aiSummary?: string;
  tags?: string[];
  pinned?: boolean;
}

export interface CleppyMood {
  expression: 'idle' | 'thinking' | 'excited' | 'helpful' | 'sleeping';
  message?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserSettings {
  clipboardMonitoring: boolean;
  aiAnalysis: boolean;
  maxHistorySize: number;
  theme: 'light' | 'dark' | 'system';
  shortcutEnabled: boolean;
}

export interface CleppyState {
  clipboardHistory: ClipboardEntry[];
  mood: CleppyMood;
  chatMessages: ChatMessage[];
  settings: UserSettings;
  isHistoryOverlayVisible: boolean;
  isAuthenticated: boolean;
  apiKey: string | null;
}
