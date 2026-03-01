import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useCleppy } from '../context/CleppyContext';
import { useClipboardHistory } from '../hooks/useClipboardHistory';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import CleppyCharacter from '../components/CleppyCharacter';
import SpeechBubble from '../components/SpeechBubble';
import ClipboardCard from '../components/ClipboardCard';
import ChatModal from '../components/ChatModal';
import HistoryOverlay from '../components/HistoryOverlay';

interface HomeScreenProps {
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { state, togglePin, removeClipboardEntry, clearHistory } = useCleppy();
  const { history } = useClipboardHistory();
  const [chatVisible, setChatVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  useKeyboardShortcut();

  const handlePaste = useCallback(async (content: string) => {
    await Clipboard.setStringAsync(content);
  }, []);

  const handleCleppyPress = () => {
    setShowBubble(false);
    setChatVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>📎 Cleppy</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={clearHistory}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>履歴クリア</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={history}
        renderItem={({ item }) => (
          <ClipboardCard
            entry={item}
            onPress={() => navigation.navigate('Detail', { entry: item })}
            onPin={() => togglePin(item.id)}
            onDelete={() => removeClipboardEntry(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>クリップボード履歴がありません</Text>
            <Text style={styles.emptySubtitle}>
              テキストをコピーすると、ここに表示されます
            </Text>
            <Text style={styles.emptyHint}>
              ⌘⇧V でいつでも履歴を呼び出せます
            </Text>
          </View>
        }
      />

      <View style={styles.cleppyContainer}>
        <SpeechBubble
          message={state.mood.message ?? 'なにかお手伝いしましょうか？'}
          visible={showBubble}
          position="top"
        />
        <CleppyCharacter onPress={handleCleppyPress} size={60} />
      </View>

      <ChatModal visible={chatVisible} onClose={() => setChatVisible(false)} />
      <HistoryOverlay onPaste={handlePaste} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  headerTitle: {
    color: '#e94560',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#16213e',
  },
  headerButtonText: {
    color: '#aaa',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyHint: {
    color: '#e94560',
    fontSize: 13,
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cleppyContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
  },
});
