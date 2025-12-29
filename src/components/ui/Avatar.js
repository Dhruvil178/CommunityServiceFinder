import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function Avatar({ source, size = 48 }) {
  return <Image source={source} style={[styles.avatar, { width: size, height: size, borderRadius: size/2 }]} />;
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: '#eee' },
});
