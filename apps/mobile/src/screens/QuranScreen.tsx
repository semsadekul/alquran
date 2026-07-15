import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@alquran/tokens';
import type { Surah } from '@alquran/types';

// For now, use a static API call. In production, this will use local storage.
const API_BASE = 'http://localhost:4000';

export function QuranScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/quran/surahs`)
      .then(res => res.json())
      .then(data => setSurahs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading surahs…</Text>
        </View>
      ) : (
        <FlatList
          data={surahs}
          keyExtractor={item => String(item.number)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable 
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.navigate('SurahReader', { 
                surahNumber: item.number,
                surahName: item.englishName
              })}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{item.number}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.nameEn}>{item.englishName}</Text>
                <Text style={styles.translation}>{item.englishNameTranslation}</Text>
                <Text style={styles.meta}>{item.revelationType} · {item.numberOfAyahs} Ayahs</Text>
              </View>
              <Text style={styles.nameAr}>{item.name}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.dark.textMuted, fontSize: 14 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.dark.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    transform: [{ rotate: '45deg' }]
  },
  numberText: { 
    color: colors.dark.accent, 
    fontWeight: '700', 
    fontSize: 14,
    transform: [{ rotate: '-45deg' }] 
  },
  info: { flex: 1 },
  nameEn: { color: colors.dark.textPrimary, fontWeight: '700', fontSize: 16 },
  translation: { color: colors.dark.textMuted, fontSize: 13, marginTop: 2 },
  meta: { color: colors.dark.accentWarm, fontSize: 11, marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
  nameAr: { color: colors.dark.arabicText, fontSize: 22, marginLeft: 8, fontFamily: 'serif' }
});
