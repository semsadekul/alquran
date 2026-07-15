import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@alquran/tokens';

interface DailyVerseWidgetProps {
  arabic: string;
  bangla: string;
  reference: string;
}

export function DailyVerseWidget({ arabic, bangla, reference }: DailyVerseWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Today&apos;s Verse</Text>
      <Text style={styles.arabic} numberOfLines={3}>{arabic}</Text>
      <Text style={styles.bangla} numberOfLines={2}>{bangla}</Text>
      <Text style={styles.reference}>{reference}</Text>
    </View>
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
  label: {
    color: colors.dark.accentWarm,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10
  },
  arabic: {
    color: colors.dark.textPrimary,
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'right',
    marginBottom: 12
  },
  bangla: {
    color: colors.dark.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10
  },
  reference: {
    color: colors.dark.textMuted,
    fontSize: 12,
    fontWeight: '600'
  }
});
