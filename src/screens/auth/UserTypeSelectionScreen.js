import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { setUserType } from '../../store/authSlice';

const UserTypeSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const selectType = type => {
    dispatch(setUserType(type));
    navigation.navigate(type === 'student' ? 'StudentAuth' : 'NGOAuth');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#0f1117', '#1a1d2e', '#0f1117']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.app}>Community Service Finder</Text>
          <Text style={styles.subtitle}>Choose how you want to continue</Text>
        </View>

        <View style={styles.cards}>
          {[
            { type: 'student', icon: 'school', title: "I'm a Student", colors: ['#6366f1', '#8b5cf6'] },
            { type: 'ngo', icon: 'business', title: "I'm an NGO", colors: ['#ec4899', '#f43f5e'] },
          ].map(item => (
            <TouchableOpacity key={item.type} onPress={() => selectType(item.type)}>
              <Surface style={styles.card}>
                <LinearGradient colors={item.colors} style={styles.cardInner}>
                  <Icon name={item.icon} size={64} color="#fff" />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Icon name="arrow-forward" size={24} color="#fff" />
                </LinearGradient>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginVertical: 40 },
  title: { color: '#9ca3af' },
  app: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  subtitle: { color: '#9ca3af' },
  cards: { flex: 1, justifyContent: 'center' },
  card: { borderRadius: 24, marginBottom: 24, overflow: 'hidden' },
  cardInner: { padding: 32, alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 20, marginVertical: 12 },
});

export default UserTypeSelectionScreen;
