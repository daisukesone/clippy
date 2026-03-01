import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useCleppy } from '../context/CleppyContext';
import { CleppyMood } from '../types';

const EXPRESSIONS: Record<CleppyMood['expression'], string> = {
  idle: '📎',
  thinking: '🤔',
  excited: '✨',
  helpful: '💡',
  sleeping: '😴',
};

interface CleppyCharacterProps {
  onPress?: () => void;
  size?: number;
}

export default function CleppyCharacter({
  onPress,
  size = 60,
}: CleppyCharacterProps) {
  const { state } = useCleppy();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, [bounceAnim]);

  useEffect(() => {
    if (state.mood.expression === 'excited') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.mood.expression, scaleAnim]);

  const emoji = EXPRESSIONS[state.mood.expression];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [
              { translateY: bounceAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    textAlign: 'center',
  },
});
