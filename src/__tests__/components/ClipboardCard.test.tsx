import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ClipboardCard from '../../components/ClipboardCard';
import { ClipboardEntry } from '../../types';

const mockEntry: ClipboardEntry = {
  id: '1',
  content: 'Hello World',
  timestamp: 1700000000000,
  type: 'text',
};

describe('ClipboardCard', () => {
  it('renders content text', () => {
    const { getByText } = render(<ClipboardCard entry={mockEntry} />);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders correct type icon for text', () => {
    const { getByText } = render(<ClipboardCard entry={mockEntry} />);
    expect(getByText('📝')).toBeTruthy();
  });

  it('renders correct type icon for url', () => {
    const urlEntry: ClipboardEntry = { ...mockEntry, type: 'url' };
    const { getByText } = render(<ClipboardCard entry={urlEntry} />);
    expect(getByText('🔗')).toBeTruthy();
  });

  it('renders correct type icon for code', () => {
    const codeEntry: ClipboardEntry = { ...mockEntry, type: 'code' };
    const { getByText } = render(<ClipboardCard entry={codeEntry} />);
    expect(getByText('💻')).toBeTruthy();
  });

  it('renders correct type icon for email', () => {
    const emailEntry: ClipboardEntry = { ...mockEntry, type: 'email' };
    const { getByText } = render(<ClipboardCard entry={emailEntry} />);
    expect(getByText('📧')).toBeTruthy();
  });

  it('renders AI summary when provided', () => {
    const entryWithSummary: ClipboardEntry = {
      ...mockEntry,
      aiSummary: '挨拶テキスト',
    };
    const { getByText } = render(<ClipboardCard entry={entryWithSummary} />);
    expect(getByText('💡 挨拶テキスト')).toBeTruthy();
  });

  it('does not render AI summary when not provided', () => {
    const { queryByText } = render(<ClipboardCard entry={mockEntry} />);
    expect(queryByText(/💡/)).toBeNull();
  });

  it('renders tags when provided', () => {
    const entryWithTags: ClipboardEntry = {
      ...mockEntry,
      tags: ['greeting', 'english'],
    };
    const { getByText } = render(<ClipboardCard entry={entryWithTags} />);
    expect(getByText('greeting')).toBeTruthy();
    expect(getByText('english')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClipboardCard entry={mockEntry} onPress={onPress} />
    );
    fireEvent.press(getByText('Hello World'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onPin when pin button is pressed', () => {
    const onPin = jest.fn();
    const { getByText } = render(
      <ClipboardCard entry={mockEntry} onPin={onPin} />
    );
    fireEvent.press(getByText('📍'));
    expect(onPin).toHaveBeenCalledTimes(1);
  });

  it('shows pinned icon when entry is pinned', () => {
    const pinnedEntry: ClipboardEntry = { ...mockEntry, pinned: true };
    const onPin = jest.fn();
    const { getByText } = render(
      <ClipboardCard entry={pinnedEntry} onPin={onPin} />
    );
    expect(getByText('📌')).toBeTruthy();
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    const { getByText } = render(
      <ClipboardCard entry={mockEntry} onDelete={onDelete} />
    );
    fireEvent.press(getByText('🗑️'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('does not render pin button when onPin is not provided', () => {
    const { queryByText } = render(<ClipboardCard entry={mockEntry} />);
    expect(queryByText('📍')).toBeNull();
    expect(queryByText('📌')).toBeNull();
  });

  it('does not render delete button when onDelete is not provided', () => {
    const { queryByText } = render(<ClipboardCard entry={mockEntry} />);
    expect(queryByText('🗑️')).toBeNull();
  });
});
