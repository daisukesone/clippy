import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SpeechBubbleProps {
  message: string;
  visible: boolean;
  position?: 'top' | 'bottom';
}

export default function SpeechBubble({
  message,
  visible,
  position = 'top',
}: SpeechBubbleProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!visible && !message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'bottom' && styles.bottom,
        { opacity },
      ]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: colors.surface, borderColor: colors.accent },
        ]}
      >
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
      <View
        style={[
          styles.arrow,
          position === 'bottom'
            ? [styles.arrowTop, { borderBottomColor: colors.accent }]
            : [styles.arrowBottom, { borderTopColor: colors.accent }],
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
  },
  bottom: {
    top: 70,
  },
  bubble: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 250,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowBottom: {
    borderTopWidth: 8,
  },
  arrowTop: {
    borderBottomWidth: 8,
  },
});
