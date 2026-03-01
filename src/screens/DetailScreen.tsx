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
import { suggestAction } from '../services/claudeService';
import { ClipboardEntry } from '../types';

interface DetailScreenProps {
  route: { params: { entry: ClipboardEntry } };
  navigation: { goBack: () => void };
}

export default function DetailScreen({ route, navigation }: DetailScreenProps) {
  const { entry } = route.params;
  const { togglePin, removeClipboardEntry } = useCleppy();
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
    <ScrollView style={styles.container}>
      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>種類</Text>
          <Text style={styles.metaValue}>{typeLabel[entry.type]}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>日時</Text>
          <Text style={styles.metaValue}>{dateStr}</Text>
        </View>
        {entry.pinned && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>状態</Text>
            <Text style={styles.metaValue}>📌 ピン留め</Text>
          </View>
        )}
      </View>

      {entry.aiSummary && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>💡 AI サマリー</Text>
          <Text style={styles.summaryText}>{entry.aiSummary}</Text>
        </View>
      )}

      <View style={styles.contentBox}>
        <Text style={styles.contentLabel}>内容</Text>
        <Text style={styles.content} selectable>
          {entry.content}
        </Text>
      </View>

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsBox}>
          <Text style={styles.tagsLabel}>タグ</Text>
          <View style={styles.tags}>
            {entry.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {suggestion && (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionLabel}>📎 Cleppy の提案</Text>
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Text style={styles.actionButtonText}>📋 コピー</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => togglePin(entry.id)}
        >
          <Text style={styles.actionButtonText}>
            {entry.pinned ? '📍 ピン解除' : '📌 ピン留め'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.suggestButton]}
          onPress={handleSuggest}
          disabled={loadingSuggestion}
        >
          <Text style={styles.actionButtonText}>
            {loadingSuggestion ? '考え中...' : '💡 Cleppy に聞く'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={[styles.actionButtonText, styles.deleteText]}>
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
    backgroundColor: '#0a0a1a',
  },
  meta: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metaLabel: {
    color: '#888',
    fontSize: 14,
  },
  metaValue: {
    color: '#ddd',
    fontSize: 14,
  },
  summaryBox: {
    margin: 16,
    padding: 14,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  summaryLabel: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summaryText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  contentBox: {
    margin: 16,
    marginTop: 0,
  },
  contentLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  content: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  tagsBox: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tagsLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#aaa',
    fontSize: 12,
  },
  suggestionBox: {
    margin: 16,
    padding: 14,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  suggestionLabel: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  suggestionText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  suggestButton: {
    borderColor: '#e94560',
  },
  actionButtonText: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: '#ff4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  deleteText: {
    color: '#ff4444',
  },
});
