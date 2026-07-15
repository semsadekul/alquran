import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@alquran/tokens';

const domains = [
  { title: 'Quran', subtitle: 'Read, listen, study', screen: 'Quran' },
  { title: 'Search', subtitle: 'Find verses and topics', screen: 'Search' },
  { title: 'Library', subtitle: 'Bookmarks and notes', screen: 'Library' }
];

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>আল কুরআন</Text>
        <Text style={styles.title}>কুরআন মাজীদ</Text>
        <Text style={styles.subtitle}>
          Read, listen, search, and study the Quran in Bangla.
        </Text>
      </View>

      <View style={styles.grid}>
        {domains.map(domain => (
          <Pressable
            key={domain.title}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate(domain.screen)}
          >
            <Text style={styles.cardTitle}>{domain.title}</Text>
            <Text style={styles.cardSubtitle}>{domain.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.background },
  content: { padding: 20, paddingTop: 60 },
  hero: { marginBottom: 32 },
  eyebrow: {
    color: colors.dark.accentWarm,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  title: { color: colors.dark.textPrimary, fontSize: 36, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: colors.dark.textSecondary, fontSize: 16, lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
  card: {
    width: '47%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  cardPressed: { 
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  },
  cardTitle: { color: colors.dark.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardSubtitle: { color: colors.dark.textMuted, fontSize: 13, lineHeight: 18 }
});
