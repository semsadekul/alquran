import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { colors } from '@alquran/tokens';
import { HADITH_COLLECTIONS } from '@alquran/hadith';

export function HadithScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={HADITH_COLLECTIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
            <Text style={styles.title}>{item.nameEnglish}</Text>
            <Text style={styles.arabic}>{item.nameArabic}</Text>
            {item.nameBangla && <Text style={styles.bangla}>{item.nameBangla}</Text>}
            <Text style={styles.desc}>{item.description}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.totalHadith?.toLocaleString()} hadith</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.background },
  list: { padding: 16 },
  card: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: 12
  },
  cardPressed: { opacity: 0.85 },
  title: { color: colors.dark.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  arabic: { color: colors.dark.textSecondary, fontSize: 16, marginBottom: 4, textAlign: 'right' },
  bangla: { color: colors.dark.textMuted, fontSize: 13, marginBottom: 6 },
  desc: { color: colors.dark.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(59,131,105,0.15)'
  },
  badgeText: { color: colors.dark.accent, fontSize: 11, fontWeight: '600' }
});
