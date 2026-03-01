import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useCleppy } from '../context/CleppyContext';

interface SettingsScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { state, updateSettings } = useCleppy();
  const { settings } = state;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>クリップボード</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>クリップボード監視</Text>
            <Text style={styles.rowSubtitle}>
              コピーしたテキストを自動で記録します
            </Text>
          </View>
          <Switch
            value={settings.clipboardMonitoring}
            onValueChange={(value) =>
              updateSettings({ clipboardMonitoring: value })
            }
            trackColor={{ false: '#0f3460', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>AI 解析</Text>
            <Text style={styles.rowSubtitle}>
              Claude API でクリップボード内容を自動分析します
            </Text>
          </View>
          <Switch
            value={settings.aiAnalysis}
            onValueChange={(value) => updateSettings({ aiAnalysis: value })}
            trackColor={{ false: '#0f3460', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>キーボードショートカット</Text>
            <Text style={styles.rowSubtitle}>
              ⌘⇧V で履歴オーバーレイを表示
            </Text>
          </View>
          <Switch
            value={settings.shortcutEnabled}
            onValueChange={(value) =>
              updateSettings({ shortcutEnabled: value })
            }
            trackColor={{ false: '#0f3460', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>表示</Text>

        <View style={styles.themeRow}>
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.themeButton,
                settings.theme === theme && styles.themeButtonActive,
              ]}
              onPress={() => updateSettings({ theme })}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  settings.theme === theme && styles.themeButtonTextActive,
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>履歴</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>最大保存数</Text>
            <Text style={styles.rowSubtitle}>
              {settings.maxHistorySize} 件
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アカウント</Text>

        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.authButtonText}>
            {state.isAuthenticated ? 'ログアウト' : 'ログイン / 登録'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Cleppy v0.1.0</Text>
        <Text style={styles.footerSubtext}>
          Powered by Claude API + Firebase
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  sectionTitle: {
    color: '#e94560',
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
    color: '#fff',
    fontSize: 16,
  },
  rowSubtitle: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  themeButtonActive: {
    borderColor: '#e94560',
    backgroundColor: '#1a1a3e',
  },
  themeButtonText: {
    color: '#888',
    fontSize: 13,
  },
  themeButtonTextActive: {
    color: '#e94560',
  },
  authButton: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  authButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerSubtext: {
    color: '#444',
    fontSize: 12,
    marginTop: 4,
  },
});
