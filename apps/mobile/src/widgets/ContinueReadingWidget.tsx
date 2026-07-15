import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@alquran/tokens';

interface ContinueReadingWidgetProps {
  surahName: string;
  ayah: number;
  surahNumber: number;
  onPress?: () => void;
}

export function ContinueReadingWidget({ surahName, ayah, surahNumber, onPress }: ContinueReadingWidgetProps) {
  return (
    <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.label}>Continue Reading</Text>
      <Text style={styles.surah}>{surahName}</Text>
      <Text style={styles.detail}>Surah {surahNumber} · Ayah {ayah}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border
  },
  pressed: { opacity: 0.85 },
  label: {
    color: colors.dark.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  surah: {
    color: colors.dark.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  detail: {
    color: colors.dark.textMuted,
    fontSize: 13
  }
});
