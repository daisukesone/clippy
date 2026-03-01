import { ClipboardEntry, ChatMessage } from '../types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

let apiKey: string | null = null;

export function setApiKey(key: string) {
  apiKey = key;
}

async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Claude API key is not set');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const textBlock = data.content.find(
    (block: { type: string }) => block.type === 'text'
  );
  return textBlock?.text ?? '';
}

export async function analyzeClipboardContent(
  content: string
): Promise<{ type: ClipboardEntry['type']; summary: string; tags: string[] }> {
  const systemPrompt = `あなたはクリップボードアシスタント「Cleppy」です。
ユーザーがコピーしたテキストを分析し、以下のJSON形式で返してください：
{
  "type": "text" | "url" | "code" | "email" | "other",
  "summary": "内容の簡潔な要約（日本語、20文字以内）",
  "tags": ["関連タグ1", "タグ2"]
}
JSONのみを返してください。`;

  const result = await callClaude(systemPrompt, content);

  try {
    return JSON.parse(result);
  } catch {
    return { type: 'text', summary: content.slice(0, 20), tags: [] };
  }
}

export async function chatWithCleppy(
  messages: ChatMessage[],
  clipboardContext?: string
): Promise<string> {
  const systemPrompt = `あなたは「Cleppy」、フレンドリーなクリップボードアシスタントです。
Microsoft Clippy にインスパイアされた、親しみやすいキャラクターとして振る舞ってください。
ユーザーのクリップボード履歴に基づいて、役立つ提案やアドバイスを提供します。
日本語で応答してください。短く、親しみやすい口調で話してください。
${clipboardContext ? `\n現在のクリップボード内容:\n${clipboardContext}` : ''}`;

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return 'なにかお手伝いできることはありますか？';
  }

  return callClaude(systemPrompt, lastMessage.content);
}

export async function suggestAction(content: string): Promise<string> {
  const systemPrompt = `あなたはクリップボードアシスタント「Cleppy」です。
コピーされた内容に対して、1つだけ短いアクション提案を日本語で返してください。
例: "URLを開きますか？", "このコードをフォーマットしましょうか？", "メールの返信を書きましょうか？"
提案のみを返してください。`;

  return callClaude(systemPrompt, content);
}
