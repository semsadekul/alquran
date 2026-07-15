import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@alquran/tokens';

interface DailyHadithWidgetProps {
  english: string;
  bangla?: string;
  collection: string;
  reference: string;
  grade?: string;
}

export function DailyHadithWidget({ english, bangla, collection, reference, grade }: DailyHadithWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Daily Hadith</Text>
      <Text style={styles.text} numberOfLines={4}>{bangla || english}</Text>
      <View style={styles.footer}>
        <Text style={styles.source}>{collection} {reference}</Text>
        {grade && <Text style={styles.grade}>{grade}</Text>}
      </View>
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
  text: {
    color: colors.dark.textSecondary,
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  source: {
    color: colors.dark.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  grade: {
    color: colors.dark.accent,
    fontSize: 11,
    fontWeight: '600'
  }
});
