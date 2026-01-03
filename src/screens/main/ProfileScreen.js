import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Text, Button, Surface, Chip, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const { level, xp, coins } = useSelector(state => state.game);
  const achievements = useSelector(
    state => Object.keys(state.achievements.unlocked || {}).length
  );

  const categories = Array.isArray(user?.preferences?.categories) ? user.preferences.categories : [];
  const notificationsEnabled = typeof user?.preferences?.notificationsEnabled === 'boolean' ? user.preferences.notificationsEnabled : true;
  const recentActivity = Array.isArray(user?.activityHistory) ? user.activityHistory : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Surface style={styles.card}>
        <Avatar.Text size={72} label={user?.name?.charAt(0) || 'D'} style={styles.avatar} />
        <Text style={styles.name}>{user?.name || 'Dhruvil'}</Text>
        {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
        {user?.phone && <Text style={styles.phone}>📞 {user.phone}</Text>}
        <View style={styles.statsRow}>
          <Chip style={styles.chip}>Lvl {level}</Chip>
          <Chip style={styles.chip}>{xp} XP</Chip>
          <Chip style={styles.chip}>🪙 {coins}</Chip>
        </View>
        <Text style={styles.achievementText}>🏆 Achievements Unlocked: {achievements}</Text>
      </Surface>

      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('EditProfile')}>Edit Profile</Button>
      <Button mode="contained" style={[styles.button, styles.securityButton]} onPress={() => navigation.navigate('Security')}>Security Settings</Button>
      <Button mode="outlined" style={styles.logoutButton} textColor="#f87171" onPress={() => dispatch(logout())}>Logout</Button>

      <Surface style={styles.card}>
        <Text style={styles.subheading}>Preferences</Text>
        <Text>Categories: {categories.length ? categories.join(', ') : 'None'}</Text>
        <Text>Notifications: {notificationsEnabled ? 'Enabled' : 'Disabled'}</Text>
        <Divider style={{ marginVertical: 12 }} />
        <Text style={styles.subheading}>Recent Activity</Text>
        {recentActivity.length ? recentActivity.slice(-5).reverse().map((activity, idx) => (
          <Text key={idx}>• {activity}</Text>
        )) : <Text>No recent activity.</Text>}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', padding: 16 },
  card: { padding: 20, borderRadius: 20, backgroundColor: '#1a1d2e', marginBottom: 20, elevation: 3 },
  avatar: { backgroundColor: '#6366f1', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  bio: { color: '#d1d5db', fontSize: 14, textAlign: 'center', marginTop: 6 },
  phone: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
  chip: { backgroundColor: '#111827' },
  achievementText: { marginTop: 12, color: '#9ca3af', fontSize: 13, textAlign: 'center' },
  button: { marginBottom: 12 },
  securityButton: { backgroundColor: '#4f46e5' },
  logoutButton: { borderColor: '#f87171' },
  subheading: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#fff' },
});
