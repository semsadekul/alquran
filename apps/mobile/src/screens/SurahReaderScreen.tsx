import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@alquran/tokens';

export function SurahReaderScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { surahNumber, surahName } = route.params;

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: surahName });
    
    // In a real app, load from local database/API
    fetch(`http://localhost:4000/quran/surahs/${surahNumber}/verses`)
      .then(res => res.json())
      .then(data => setVerses(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [surahNumber, surahName, navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading verses...</Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={item => String(item.ayah)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            surahNumber !== 1 && surahNumber !== 9 ? (
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.verseCard}>
              <View style={styles.verseHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.surah}:{item.ayah}</Text>
                </View>
              </View>
              <Text style={styles.arabic}>{item.arabic}</Text>
              <Text style={styles.translationLabel}>Bangla</Text>
              <Text style={styles.bangla}>{item.bangla}</Text>
              <Text style={styles.translationLabel}>English</Text>
              <Text style={styles.english}>{item.english}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.dark.textMuted },
  list: { padding: 16 },
  bismillah: { 
    fontFamily: 'serif',
    fontSize: 28, 
    color: colors.dark.arabicText, 
    textAlign: 'center', 
    marginBottom: 32,
    marginTop: 16
  },
  verseCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border
  },
  verseHeader: { marginBottom: 16, flexDirection: 'row' },
  badge: {
    backgroundColor: colors.dark.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999
  },
  badgeText: { color: colors.dark.textMuted, fontSize: 12, fontWeight: '700' },
  arabic: {
    fontFamily: 'serif',
    fontSize: 28,
    color: colors.dark.arabicText,
    textAlign: 'right',
    lineHeight: 44,
    marginBottom: 24
  },
  translationLabel: {
    color: colors.dark.accent,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6
  },
  bangla: {
    fontSize: 16,
    color: colors.dark.textPrimary,
    lineHeight: 24,
    marginBottom: 16
  },
  english: {
    fontSize: 15,
    color: colors.dark.textSecondary,
    lineHeight: 22
  }
});
