import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useCleppy } from '../context/CleppyContext';
import { useTheme } from '../context/ThemeContext';
import { suggestAction } from '../services/claudeService';
import { ClipboardEntry } from '../types';

interface DetailScreenProps {
  route: { params: { entry: ClipboardEntry } };
  navigation: { goBack: () => void };
}

export default function DetailScreen({ route, navigation }: DetailScreenProps) {
  const { entry } = route.params;
  const { togglePin, removeClipboardEntry } = useCleppy();
  const { colors } = useTheme();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(entry.content);
    Alert.alert('コピーしました', 'クリップボードにコピーしました');
  };

  const handleDelete = () => {
    removeClipboardEntry(entry.id);
    navigation.goBack();
  };

  const handleSuggest = async () => {
    setLoadingSuggestion(true);
    try {
      const result = await suggestAction(entry.content);
      setSuggestion(result);
    } catch {
      setSuggestion('提案を取得できませんでした');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const typeLabel: Record<ClipboardEntry['type'], string> = {
    text: 'テキスト',
    url: 'URL',
    code: 'コード',
    email: 'メール',
    other: 'その他',
  };

  const dateStr = new Date(entry.timestamp).toLocaleString('ja-JP');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.meta, { borderBottomColor: colors.border }]}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>種類</Text>
          <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
            {typeLabel[entry.type]}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>日時</Text>
          <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
            {dateStr}
          </Text>
        </View>
        {entry.pinned && (
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>状態</Text>
            <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
              📌 ピン留め
            </Text>
          </View>
        )}
      </View>

      {entry.aiSummary && (
        <View
          style={[
            styles.summaryBox,
            { backgroundColor: colors.surface, borderColor: colors.accent },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: colors.accent }]}>
            💡 AI サマリー
          </Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {entry.aiSummary}
          </Text>
        </View>
      )}

      <View style={styles.contentBox}>
        <Text style={[styles.contentLabel, { color: colors.textMuted }]}>
          内容
        </Text>
        <Text
          style={[
            styles.content,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          selectable
        >
          {entry.content}
        </Text>
      </View>

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsBox}>
          <Text style={[styles.tagsLabel, { color: colors.textMuted }]}>タグ</Text>
          <View style={styles.tags}>
            {entry.tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: colors.border }]}
              >
                <Text style={[styles.tagText, { color: colors.textMuted }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {suggestion && (
        <View
          style={[
            styles.suggestionBox,
            { backgroundColor: colors.surface, borderColor: colors.accent },
          ]}
        >
          <Text style={[styles.suggestionLabel, { color: colors.accent }]}>
            📎 Cleppy の提案
          </Text>
          <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
            {suggestion}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handleCopy}
        >
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            📋 コピー
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => togglePin(entry.id)}
        >
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            {entry.pinned ? '📍 ピン解除' : '📌 ピン留め'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.surface, borderColor: colors.accent },
          ]}
          onPress={handleSuggest}
          disabled={loadingSuggestion}
        >
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            {loadingSuggestion ? '考え中...' : '💡 Cleppy に聞く'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { borderColor: colors.danger, backgroundColor: colors.accentDim },
          ]}
          onPress={handleDelete}
        >
          <Text style={[styles.actionButtonText, { color: colors.danger }]}>
            🗑️ 削除
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  meta: {
    padding: 16,
    borderBottomWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
  },
  summaryBox: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contentBox: {
    margin: 16,
    marginTop: 0,
  },
  contentLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  content: {
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    lineHeight: 22,
    borderWidth: 1,
  },
  tagsBox: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
  },
  suggestionBox: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 10,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
