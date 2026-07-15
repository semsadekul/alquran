import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@alquran/tokens';

const sections = [
  { title: 'Bookmarks', description: 'Verses you saved for recitation, study, or memorization.' },
  { title: 'Highlights', description: 'Passages you highlighted during study.' },
  { title: 'Notes', description: 'Your study notes attached to verses and chapters.' },
  { title: 'Collections', description: 'Organized study collections of verses and passages.' }
];

export function LibraryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>লাইব্রেরি</Text>
        <Text style={styles.subtitle}>
          Bookmarks, highlights, notes, and collections from your study sessions.
        </Text>
      </View>
      <View style={styles.list}>
        {sections.map(section => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardSubtitle}>{section.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.background },
  header: { padding: 24, paddingTop: 40 },
  title: { color: colors.dark.textPrimary, fontSize: 32, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: colors.dark.textSecondary, fontSize: 16, lineHeight: 24 },
  list: { padding: 20 },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  cardTitle: { color: colors.dark.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardSubtitle: { color: colors.dark.textMuted, fontSize: 14, lineHeight: 20 }
});
