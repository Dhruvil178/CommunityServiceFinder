import React from 'react';
import { View, StyleSheet, FlatList, Share } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const certificates = [
  {
    id: '1',
    title: 'Environmental Steward',
    description: 'Completed 20+ hours of environmental community service',
    dateEarned: '2024-07-15',
    issuer: 'Green Earth Initiative',
    hoursCompleted: 24,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  },
  {
    id: '2',
    title: 'Community Helper',
    description: 'Dedicated volunteer with 15+ hours of community support',
    dateEarned: '2024-06-10',
    issuer: 'City Volunteer Program',
    hoursCompleted: 18,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
  },
  {
    id: '3',
    title: 'Education Advocate',
    description: 'Supporter of educational programs and literacy initiatives',
    dateEarned: '2024-05-20',
    issuer: 'Education First Foundation',
    hoursCompleted: 12,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
];

const CertificatesScreen = () => {
  const theme = useTheme();

  const handleShare = async (certificate) => {
    try {
      const result = await Share.share({
        message: `I earned the "${certificate.title}" certificate from ${certificate.issuer}!`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert('Error sharing certificate: ' + error.message);
    }
  };

  const renderCertificate = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.description}</Paragraph>
        <Paragraph>Issued by {item.issuer} on {item.dateEarned}</Paragraph>
        <Paragraph>Hours Completed: {item.hoursCompleted}</Paragraph>
        <Button mode="outlined" onPress={() => handleShare(item)} style={styles.shareButton}>
          Share
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        renderItem={renderCertificate}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { marginBottom: 16 },
  shareButton: { marginTop: 12 },
});

export default CertificatesScreen;
