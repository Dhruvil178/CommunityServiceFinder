import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Card, Title, Text, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const achievements = [
  {
    id: '1',
    title: 'Environmental Steward',
    rarity: 'Rare',
    xp: 300,
    unlocked: true,
  },
  {
    id: '2',
    title: 'Community Champion',
    rarity: 'Epic',
    xp: 500,
    unlocked: false,
  },
];

const CertificatesScreen = () => (
  <SafeAreaView style={styles.container}>
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={achievements}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <Card style={[styles.card, !item.unlocked && styles.locked]}>
          <Card.Content>
            <Title>{item.unlocked ? item.title : '🔒 Locked Achievement'}</Title>
            <Chip style={styles.rarity}>{item.rarity}</Chip>
            <Text>⚡ XP: {item.xp}</Text>
            {!item.unlocked && <Text>Complete more quests to unlock</Text>}
          </Card.Content>
        </Card>
      )}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  card: { marginBottom: 12, backgroundColor: '#1a1d2e' },
  locked: { opacity: 0.4 },
  rarity: { marginVertical: 8, backgroundColor: '#fbbf24' },
});

export default CertificatesScreen;
