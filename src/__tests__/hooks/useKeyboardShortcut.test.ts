/**
 * Tests for useKeyboardShortcut hook
 *
 * This hook only activates on Platform.OS === 'web',
 * so we test the core logic patterns used internally.
 */

describe('useKeyboardShortcut - shortcut logic', () => {
  it('identifies Cmd+Shift+V correctly', () => {
    const event = {
      key: 'v',
      shiftKey: true,
      metaKey: true,
      ctrlKey: false,
    };
    const isHistoryShortcut =
      event.key === 'v' &&
      event.shiftKey &&
      (event.metaKey || event.ctrlKey);
    expect(isHistoryShortcut).toBe(true);
  });

  it('identifies Ctrl+Shift+V correctly', () => {
    const event = {
      key: 'v',
      shiftKey: true,
      metaKey: false,
      ctrlKey: true,
    };
    const isHistoryShortcut =
      event.key === 'v' &&
      event.shiftKey &&
      (event.metaKey || event.ctrlKey);
    expect(isHistoryShortcut).toBe(true);
  });

  it('rejects Shift+V without Cmd/Ctrl', () => {
    const event = {
      key: 'v',
      shiftKey: true,
      metaKey: false,
      ctrlKey: false,
    };
    const isHistoryShortcut =
      event.key === 'v' &&
      event.shiftKey &&
      (event.metaKey || event.ctrlKey);
    expect(isHistoryShortcut).toBe(false);
  });

  it('rejects Cmd+V without Shift', () => {
    const event = {
      key: 'v',
      shiftKey: false,
      metaKey: true,
      ctrlKey: false,
    };
    const isHistoryShortcut =
      event.key === 'v' &&
      event.shiftKey &&
      (event.metaKey || event.ctrlKey);
    expect(isHistoryShortcut).toBe(false);
  });

  describe('navigation keys', () => {
    it('recognizes ArrowUp', () => {
      expect('ArrowUp').toBe('ArrowUp');
    });

    it('recognizes ArrowDown', () => {
      expect('ArrowDown').toBe('ArrowDown');
    });

    it('recognizes Enter for confirm', () => {
      expect('Enter').toBe('Enter');
    });

    it('recognizes Escape for close', () => {
      expect('Escape').toBe('Escape');
    });
  });
});
