import React from 'react';
import { render } from '@testing-library/react-native';
import SpeechBubble from '../../components/SpeechBubble';

describe('SpeechBubble', () => {
  it('renders message text when visible', () => {
    const { getByText } = render(
      <SpeechBubble message="こんにちは！" visible={true} />
    );
    expect(getByText('こんにちは！')).toBeTruthy();
  });

  it('returns null when not visible and no message', () => {
    const { toJSON } = render(
      <SpeechBubble message="" visible={false} />
    );
    expect(toJSON()).toBeNull();
  });

  it('still renders when visible is false but message exists (for fade-out animation)', () => {
    const { getByText } = render(
      <SpeechBubble message="テスト" visible={false} />
    );
    expect(getByText('テスト')).toBeTruthy();
  });

  it('renders with default position (top)', () => {
    const { toJSON } = render(
      <SpeechBubble message="テスト" visible={true} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with bottom position', () => {
    const { toJSON } = render(
      <SpeechBubble message="テスト" visible={true} position="bottom" />
    );
    expect(toJSON()).toBeTruthy();
  });
});
