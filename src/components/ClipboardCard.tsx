import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ClipboardEntry } from '../types';

const TYPE_ICONS: Record<ClipboardEntry['type'], string> = {
  text: '📝',
  url: '🔗',
  code: '💻',
  email: '📧',
  other: '📋',
};

interface ClipboardCardProps {
  entry: ClipboardEntry;
  onPress?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  selected?: boolean;
}

export default function ClipboardCard({
  entry,
  onPress,
  onPin,
  onDelete,
  selected = false,
}: ClipboardCardProps) {
  const { colors } = useTheme();
  const icon = TYPE_ICONS[entry.type];
  const timeStr = new Date(entry.timestamp).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>{timeStr}</Text>
        <View style={styles.actions}>
          {onPin && (
            <TouchableOpacity onPress={onPin} style={styles.actionButton}>
              <Text style={styles.actionText}>
                {entry.pinned ? '📌' : '📍'}
              </Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={3}>
        {entry.content}
      </Text>

      {entry.aiSummary && (
        <Text style={[styles.summary, { color: colors.accent }]}>
          💡 {entry.aiSummary}
        </Text>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tags}>
          {entry.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.textMuted }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    marginHorizontal: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 14,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  summary: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
  },
});
