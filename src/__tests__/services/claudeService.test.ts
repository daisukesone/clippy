import {
  analyzeClipboardContent,
  chatWithCleppy,
  suggestAction,
  setApiKey,
} from '../../services/claudeService';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('claudeService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setApiKey('test-api-key');
  });

  describe('analyzeClipboardContent', () => {
    it('returns parsed analysis when API succeeds', async () => {
      const apiResponse = {
        type: 'url',
        summary: 'GitHubリポジトリ',
        tags: ['github', 'programming'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: JSON.stringify(apiResponse) }],
          }),
      });

      const result = await analyzeClipboardContent(
        'https://github.com/example/repo'
      );
      expect(result.type).toBe('url');
      expect(result.summary).toBe('GitHubリポジトリ');
      expect(result.tags).toEqual(['github', 'programming']);
    });

    it('returns fallback when API returns invalid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: 'not valid json' }],
          }),
      });

      const result = await analyzeClipboardContent('some content');
      expect(result.type).toBe('text');
      expect(result.summary).toBe('some content');
      expect(result.tags).toEqual([]);
    });

    it('throws when API key is not set', async () => {
      setApiKey('');
      // setApiKey with empty string doesn't unset, let's simulate
      // Actually the check is `if (!apiKey)` so empty string will be falsy
      // But setApiKey just assigns, so we need to trick it
      // The function checks `if (!apiKey)` which is falsy for empty string
      // Let me re-check the implementation... setApiKey sets apiKey = key
      // and callClaude checks if (!apiKey)
      // Empty string is falsy, so this should throw
      await expect(analyzeClipboardContent('test')).rejects.toThrow(
        'Claude API key is not set'
      );
    });

    it('throws on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(
        analyzeClipboardContent('test')
      ).rejects.toThrow('Claude API error: 401');
    });
  });

  describe('chatWithCleppy', () => {
    it('returns Claude response for user message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              { type: 'text', text: 'こんにちは！お手伝いします。' },
            ],
          }),
      });

      const result = await chatWithCleppy([
        {
          id: '1',
          role: 'user',
          content: 'こんにちは',
          timestamp: Date.now(),
        },
      ]);

      expect(result).toBe('こんにちは！お手伝いします。');
    });

    it('returns default message when no user message', async () => {
      const result = await chatWithCleppy([]);
      expect(result).toBe('なにかお手伝いできることはありますか？');
    });

    it('returns default message when last message is assistant', async () => {
      const result = await chatWithCleppy([
        {
          id: '1',
          role: 'assistant',
          content: 'previous response',
          timestamp: Date.now(),
        },
      ]);
      expect(result).toBe('なにかお手伝いできることはありますか？');
    });

    it('includes clipboard context in system prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: 'response' }],
          }),
      });

      await chatWithCleppy(
        [
          {
            id: '1',
            role: 'user',
            content: 'これは何？',
            timestamp: Date.now(),
          },
        ],
        'clipboard content here'
      );

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.system).toContain('clipboard content here');
    });
  });

  describe('suggestAction', () => {
    it('returns suggestion from Claude', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: 'URLを開きますか？' }],
          }),
      });

      const result = await suggestAction('https://example.com');
      expect(result).toBe('URLを開きますか？');
    });
  });

  describe('API request format', () => {
    it('sends correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: '{}' }],
          }),
      });

      await analyzeClipboardContent('test');

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toBe('https://api.anthropic.com/v1/messages');
      expect(fetchCall[1].headers['x-api-key']).toBe('test-api-key');
      expect(fetchCall[1].headers['anthropic-version']).toBe('2023-06-01');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
    });

    it('uses correct model', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: '{}' }],
          }),
      });

      await analyzeClipboardContent('test');

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.model).toBe('claude-sonnet-4-20250514');
      expect(body.max_tokens).toBe(1024);
    });
  });
});
