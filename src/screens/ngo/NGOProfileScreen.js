// src/screens/ngo/NGOProfileScreen.js
// FIX: Avatar.Icon icon="business" → icon="domain"
// (Avatar.Icon is a react-native-paper component → uses MaterialCommunityIcons
//  "business" only exists in MaterialIcons, not MaterialCommunityIcons
//  "domain" is the correct MaterialCommunityIcons equivalent)

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card, Chip, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { updateProfile, logout } from '../../store/authSlice';

const NGOProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);

  const [isEditing, setIsEditing]                 = useState(false);
  const [name, setName]                           = useState(user?.name || '');
  const [description, setDescription]             = useState(user?.description || '');
  const [contactNumber, setContactNumber]         = useState(user?.contactNumber || '');
  const [website, setWebsite]                     = useState(user?.website || '');
  const [street, setStreet]                       = useState(user?.address?.street || '');
  const [city, setCity]                           = useState(user?.address?.city || '');
  const [state, setState]                         = useState(user?.address?.state || '');
  const [zipCode, setZipCode]                     = useState(user?.address?.zipCode || '');
  const [selectedCategories, setSelectedCategories] = useState(user?.categories || []);

  const categories = [
    'Environmental', 'Education', 'Health',
    'Community Support', 'Animal Welfare', 'Technology',
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({
        name, description, contactNumber, website,
        address: { street, city, state, zipCode },
        categories: selectedCategories,
      })).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            {/* FIX: was icon="business" (MaterialIcons only)
                     now icon="domain" (valid in MaterialCommunityIcons) */}
            <Avatar.Icon size={80} icon="domain" style={styles.avatar} />
            <Title style={styles.orgName}>{user?.organizationName}</Title>
            <Paragraph style={styles.email}>{user?.email}</Paragraph>
            {user?.verified && (
              <Chip icon="check-decagram" style={styles.verifiedChip}>
                Verified Organization
              </Chip>
            )}
            <Paragraph style={styles.regNumber}>
              Reg. No: {user?.registrationNumber}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Profile info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={styles.cardTitle}>Profile Information</Title>
              {!isEditing && (
                <Button mode="contained" compact onPress={() => setIsEditing(true)} icon="pencil">
                  Edit
                </Button>
              )}
            </View>
            <Divider style={styles.divider} />

            {isEditing ? (
              <>
                <TextInput label="Contact Person Name" value={name} onChangeText={setName}
                  mode="outlined" style={styles.input} />
                <TextInput label="Description" value={description} onChangeText={setDescription}
                  mode="outlined" multiline numberOfLines={4} style={styles.input} />
                <TextInput label="Contact Number" value={contactNumber} onChangeText={setContactNumber}
                  mode="outlined" keyboardType="phone-pad" style={styles.input} />
                <TextInput label="Website" value={website} onChangeText={setWebsite}
                  mode="outlined" keyboardType="url" autoCapitalize="none" style={styles.input} />

                <Paragraph style={styles.sectionLabel}>Address</Paragraph>
                <TextInput label="Street" value={street} onChangeText={setStreet}
                  mode="outlined" style={styles.input} />
                <TextInput label="City" value={city} onChangeText={setCity}
                  mode="outlined" style={styles.input} />
                <TextInput label="State" value={state} onChangeText={setState}
                  mode="outlined" style={styles.input} />
                <TextInput label="Zip Code" value={zipCode} onChangeText={setZipCode}
                  mode="outlined" keyboardType="number-pad" style={styles.input} />

                <Paragraph style={styles.sectionLabel}>Categories</Paragraph>
                <View style={styles.categoriesContainer}>
                  {categories.map(cat => (
                    <Chip key={cat} selected={selectedCategories.includes(cat)}
                      onPress={() => toggleCategory(cat)} style={styles.chip}>
                      {cat}
                    </Chip>
                  ))}
                </View>

                <View style={styles.editActions}>
                  <Button mode="outlined" onPress={() => setIsEditing(false)} style={styles.actionBtn}>
                    Cancel
                  </Button>
                  <Button mode="contained" onPress={handleSave}
                    loading={isLoading} disabled={isLoading} style={styles.actionBtn}>
                    Save Changes
                  </Button>
                </View>
              </>
            ) : (
              <>
                {[
                  { icon: 'person',      label: 'Contact Person', value: user?.name },
                  { icon: 'description', label: 'Description',    value: user?.description },
                  { icon: 'phone',       label: 'Contact Number', value: user?.contactNumber },
                  { icon: 'language',    label: 'Website',        value: user?.website },
                  { icon: 'location-on', label: 'Address',
                    value: [user?.address?.street, user?.address?.city,
                            user?.address?.state,  user?.address?.zipCode]
                              .filter(Boolean).join(', ') || 'Not provided' },
                ].map(row => (
                  <View key={row.label} style={styles.infoRow}>
                    <Icon name={row.icon} size={20} color="#8b5cf6" />
                    <View style={styles.infoContent}>
                      <Paragraph style={styles.infoLabel}>{row.label}</Paragraph>
                      <Paragraph style={styles.infoValue}>{row.value || 'Not provided'}</Paragraph>
                    </View>
                  </View>
                ))}

                <View style={styles.infoRow}>
                  <Icon name="category" size={20} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Paragraph style={styles.infoLabel}>Categories</Paragraph>
                    <View style={styles.categoriesDisplay}>
                      {user?.categories?.length > 0
                        ? user.categories.map(cat => <Chip key={cat} style={styles.displayChip}>{cat}</Chip>)
                        : <Paragraph style={styles.infoValue}>No categories selected</Paragraph>
                      }
                    </View>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Account */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Account</Title>
            <Divider style={styles.divider} />
            <Button mode="outlined" icon="lock" onPress={() => navigation.navigate('Security')}
              style={styles.accountBtn}>
              Security Settings
            </Button>
            <Button mode="contained" icon="logout" onPress={handleLogout}
              style={styles.logoutBtn} buttonColor="#ef4444">
              Logout
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0f1117' },
  scrollContent:      { padding: 16, paddingBottom: 32 },
  headerCard:         { backgroundColor: '#1a1d2e', marginBottom: 16 },
  headerContent:      { alignItems: 'center', paddingVertical: 20 },
  avatar:             { backgroundColor: '#8b5cf6', marginBottom: 16 },
  orgName:            { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  email:              { color: '#9ca3af', marginBottom: 12 },
  verifiedChip:       { backgroundColor: '#10b98120', marginBottom: 8 },
  regNumber:          { color: '#6b7280', fontSize: 12 },
  card:               { backgroundColor: '#1a1d2e', marginBottom: 16 },
  cardHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle:          { color: '#fff', fontSize: 18 },
  divider:            { backgroundColor: '#374151', marginBottom: 16 },
  infoRow:            { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoContent:        { flex: 1 },
  infoLabel:          { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  infoValue:          { color: '#fff', fontSize: 14 },
  categoriesDisplay:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  displayChip:        { marginBottom: 4 },
  input:              { marginBottom: 12, backgroundColor: '#0f1117' },
  sectionLabel:       { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 12 },
  categoriesContainer:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:               { marginBottom: 4 },
  editActions:        { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn:          { flex: 1 },
  accountBtn:         { marginBottom: 12 },
  logoutBtn:          { marginTop: 4 },
});

export default NGOProfileScreen;