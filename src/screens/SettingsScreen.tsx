import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useCleppy } from '../context/CleppyContext';
import { useTheme } from '../context/ThemeContext';
import { setApiKey as setClaudeApiKey } from '../services/claudeService';

interface SettingsScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { state, updateSettings, setApiKey } = useCleppy();
  const { colors } = useTheme();
  const { settings } = state;
  const [keyInput, setKeyInput] = useState(state.apiKey ?? '');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveApiKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed) {
      setApiKey(trimmed);
      setClaudeApiKey(trimmed);
      try {
        localStorage.setItem('cleppy_api_key', trimmed);
      } catch {}
    } else {
      setApiKey(null);
      try {
        localStorage.removeItem('cleppy_api_key');
      } catch {}
    }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    section: { borderBottomColor: colors.border },
    sectionTitle: { color: colors.accent },
    rowTitle: { color: colors.text },
    rowSubtitle: { color: colors.textMuted },
    themeButton: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    themeButtonActive: {
      borderColor: colors.accent,
      backgroundColor: colors.surfaceAlt,
    },
    themeButtonText: { color: colors.textMuted },
    themeButtonTextActive: { color: colors.accent },
    authButton: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    authButtonText: { color: colors.accent },
    footerText: { color: colors.textMuted },
    footerSubtext: { color: colors.textMuted },
    apiInput: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          API 設定
        </Text>

        <View style={styles.apiKeySection}>
          <Text style={[styles.rowTitle, dynamicStyles.rowTitle]}>
            Claude API キー
          </Text>
          <Text style={[styles.rowSubtitle, dynamicStyles.rowSubtitle]}>
            AI 解析・チャット機能に必要です
          </Text>
          <View style={styles.apiKeyInputRow}>
            <TextInput
              style={[styles.apiInput, dynamicStyles.apiInput]}
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk-ant-api..."
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.apiToggleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowKey(!showKey)}
            >
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>
                {showKey ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: keySaved ? '#2d8a4e' : colors.accent }]}
            onPress={handleSaveApiKey}
          >
            <Text style={styles.saveButtonText}>
              {keySaved ? '保存しました' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          クリップボード
        </Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, dynamicStyles.rowTitle]}>
              クリップボード監視
            </Text>
            <Text style={[styles.rowSubtitle, dynamicStyles.rowSubtitle]}>
              コピーしたテキストを自動で記録します
            </Text>
          </View>
          <Switch
            value={settings.clipboardMonitoring}
            onValueChange={(value) =>
              updateSettings({ clipboardMonitoring: value })
            }
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, dynamicStyles.rowTitle]}>
              AI 解析
            </Text>
            <Text style={[styles.rowSubtitle, dynamicStyles.rowSubtitle]}>
              Claude API でクリップボード内容を自動分析します
            </Text>
          </View>
          <Switch
            value={settings.aiAnalysis}
            onValueChange={(value) => updateSettings({ aiAnalysis: value })}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, dynamicStyles.rowTitle]}>
              キーボードショートカット
            </Text>
            <Text style={[styles.rowSubtitle, dynamicStyles.rowSubtitle]}>
              ⌘⇧V で履歴オーバーレイを表示
            </Text>
          </View>
          <Switch
            value={settings.shortcutEnabled}
            onValueChange={(value) =>
              updateSettings({ shortcutEnabled: value })
            }
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          表示
        </Text>

        <View style={styles.themeRow}>
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.themeButton,
                dynamicStyles.themeButton,
                settings.theme === theme && dynamicStyles.themeButtonActive,
              ]}
              onPress={() => updateSettings({ theme })}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  dynamicStyles.themeButtonText,
                  settings.theme === theme && dynamicStyles.themeButtonTextActive,
                ]}
              >
                {theme === 'light'
                  ? '☀️ ライト'
                  : theme === 'dark'
                    ? '🌙 ダーク'
                    : '📱 システム'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          履歴
        </Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, dynamicStyles.rowTitle]}>
              最大保存数
            </Text>
            <Text style={[styles.rowSubtitle, dynamicStyles.rowSubtitle]}>
              {settings.maxHistorySize} 件
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          アカウント
        </Text>

        <TouchableOpacity
          style={[styles.authButton, dynamicStyles.authButton]}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={[styles.authButtonText, dynamicStyles.authButtonText]}>
            {state.isAuthenticated ? 'ログアウト' : 'ログイン / 登録'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, dynamicStyles.footerText]}>
          Cleppy v0.1.0
        </Text>
        <Text style={[styles.footerSubtext, dynamicStyles.footerSubtext]}>
          Powered by Claude API + Firebase
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  apiKeySection: {
    gap: 8,
  },
  apiKeyInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  apiInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    fontFamily: 'monospace',
  },
  apiToggleButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 13,
  },
  authButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
