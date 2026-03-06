import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useCleppy } from '../context/CleppyContext';
import { useTheme } from '../context/ThemeContext';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import ClipboardCard from './ClipboardCard';
import { ClipboardEntry } from '../types';

interface HistoryOverlayProps {
  onPaste?: (content: string) => void;
}

export default function HistoryOverlay({ onPaste }: HistoryOverlayProps) {
  const { state, setHistoryOverlay } = useCleppy();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const filteredHistory = state.clipboardHistory.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.content.toLowerCase().includes(query) ||
      entry.aiSummary?.toLowerCase().includes(query) ||
      entry.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const handleSelectUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSelectDown = useCallback(() => {
    setSelectedIndex((prev) =>
      Math.min(filteredHistory.length - 1, prev + 1)
    );
  }, [filteredHistory.length]);

  const handleConfirm = useCallback(() => {
    const selected = filteredHistory[selectedIndex];
    if (selected) {
      onPaste?.(selected.content);
      setHistoryOverlay(false);
    }
  }, [filteredHistory, selectedIndex, onPaste, setHistoryOverlay]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  useKeyboardShortcut({
    onSelectUp: handleSelectUp,
    onSelectDown: handleSelectDown,
    onConfirm: handleConfirm,
    onHistoryClose: handleClose,
  });

  useEffect(() => {
    if (state.isHistoryOverlayVisible) {
      setSelectedIndex(0);
      setSearchQuery('');
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [state.isHistoryOverlayVisible, slideAnim]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleItemPress = (entry: ClipboardEntry) => {
    onPaste?.(entry.content);
    setHistoryOverlay(false);
  };

  return (
    <Modal
      visible={state.isHistoryOverlayVisible}
      animationType="none"
      transparent
    >
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        activeOpacity={1}
        onPress={() => setHistoryOverlay(false)}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              borderColor: colors.accent,
              shadowColor: colors.accent,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                📋 クリップボード履歴
              </Text>
              <Text
                style={[
                  styles.shortcut,
                  { color: colors.textMuted, backgroundColor: colors.border },
                ]}
              >
                ⌘⇧V
              </Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                ref={searchInputRef}
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="検索..."
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredHistory}
              renderItem={({ item, index }) => (
                <ClipboardCard
                  entry={item}
                  selected={index === selectedIndex}
                  onPress={() => handleItemPress(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              style={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    {searchQuery
                      ? '該当する履歴がありません'
                      : 'クリップボード履歴がありません'}
                  </Text>
                </View>
              }
            />

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                ↑↓ 選択 · Enter 貼り付け · Esc 閉じる
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '70%',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shortcut: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  searchContainer: {
    padding: 12,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  list: {
    maxHeight: 350,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  hint: {
    fontSize: 12,
  },
});
