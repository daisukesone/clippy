import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCleppy } from '../context/CleppyContext';
import { useTheme } from '../context/ThemeContext';
import { chatWithCleppy } from '../services/claudeService';
import { ChatMessage } from '../types';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatModal({ visible, onClose }: ChatModalProps) {
  const { state, addChatMessage, setMood } = useCleppy();
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    setInput('');
    setMood({ expression: 'thinking' });
    setLoading(true);

    try {
      const latestClipboard = state.clipboardHistory[0]?.content;
      const response = await chatWithCleppy(
        [...state.chatMessages, userMessage],
        latestClipboard
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      addChatMessage(assistantMessage);
      setMood({ expression: 'helpful', message: response });
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ごめんなさい、エラーが発生しました。もう一度試してください。',
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setMood({ expression: 'idle' }), 3000);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === 'user'
          ? [styles.userMessage, { backgroundColor: colors.accent }]
          : [
              styles.assistantMessage,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ],
      ]}
    >
      {item.role === 'assistant' && (
        <Text style={[styles.cleppyLabel, { color: colors.accent }]}>
          📎 Cleppy
        </Text>
      )}
      <Text style={[styles.messageText, { color: colors.text }]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              📎 Cleppy とチャット
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.textMuted }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={state.chatMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📎</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  こんにちは！Cleppy です。{'\n'}
                  クリップボードのことなら何でも聞いてね！
                </Text>
              </View>
            }
          />

          <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              value={input}
              onChangeText={setInput}
              placeholder="メッセージを入力..."
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!loading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.accent },
                loading && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? '...' : '送信'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    padding: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  cleppyLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
