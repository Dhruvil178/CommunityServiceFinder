import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Badge({ children, style }) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#eee', borderRadius: 12 },
  text: { fontSize: 12 },
});
