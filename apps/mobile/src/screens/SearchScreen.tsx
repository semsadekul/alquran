import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { colors } from '@alquran/tokens';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setLoading(true);
    setSearched(true);
    // Will use local storage or API
    setLoading(false);
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="কুরআন খুঁজুন (Surah, Keyword)..."
          placeholderTextColor={colors.dark.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {searched && !loading && results.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results for &ldquo;{query.trim()}&rdquo;</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => String(item.number)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.resultCard}>
            <Text style={styles.resultHeader}>Surah {item.surah}, Verse {item.ayah}</Text>
            <Text style={styles.resultArabic} numberOfLines={2}>{item.arabic}</Text>
            <Text style={styles.resultEnglish} numberOfLines={2}>{item.english}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.background },
  searchBox: { padding: 16, paddingTop: 24 },
  input: {
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    color: colors.dark.textPrimary,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.dark.textMuted, fontSize: 15 },
  list: { padding: 16 },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: 12
  },
  resultHeader: { color: colors.dark.accent, fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultArabic: { color: colors.dark.arabicText, fontSize: 24, lineHeight: 36, textAlign: 'right', marginBottom: 12, fontFamily: 'serif' },
  resultEnglish: { color: colors.dark.textSecondary, fontSize: 15, lineHeight: 24 }
});
