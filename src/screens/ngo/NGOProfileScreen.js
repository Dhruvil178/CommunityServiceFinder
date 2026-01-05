// src/screens/ngo/NGOProfileScreen.js
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

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [description, setDescription] = useState(user?.description || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [selectedCategories, setSelectedCategories] = useState(user?.categories || []);

  const categories = ['Environmental', 'Education', 'Health', 'Community Support', 'Animal Welfare', 'Technology'];

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({
        name,
        description,
        contactNumber,
        website,
        address: {
          street,
          city,
          state,
          zipCode
        },
        categories: selectedCategories
      })).unwrap();
      
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            dispatch(logout());
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Icon 
              size={80} 
              icon="business" 
              style={styles.avatar}
            />
            <Title style={styles.orgName}>{user?.organizationName}</Title>
            <Paragraph style={styles.email}>{user?.email}</Paragraph>
            
            {user?.verified && (
              <Chip icon="verified" style={styles.verifiedChip}>
                Verified Organization
              </Chip>
            )}
            
            <Paragraph style={styles.registrationNumber}>
              Reg. No: {user?.registrationNumber}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Profile Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={styles.cardTitle}>Profile Information</Title>
              {!isEditing && (
                <Button 
                  mode="contained" 
                  compact
                  onPress={() => setIsEditing(true)}
                  icon="pencil"
                >
                  Edit
                </Button>
              )}
            </View>

            <Divider style={styles.divider} />

            {isEditing ? (
              // Edit Mode
              <>
                <TextInput
                  label="Contact Person Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />

                <TextInput
                  label="Contact Number"
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                />

                <TextInput
                  label="Website"
                  value={website}
                  onChangeText={setWebsite}
                  mode="outlined"
                  keyboardType="url"
                  autoCapitalize="none"
                  style={styles.input}
                />

                <Paragraph style={styles.sectionLabel}>Address</Paragraph>

                <TextInput
                  label="Street"
                  value={street}
                  onChangeText={setStreet}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="State"
                  value={state}
                  onChangeText={setState}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Zip Code"
                  value={zipCode}
                  onChangeText={setZipCode}
                  mode="outlined"
                  keyboardType="number-pad"
                  style={styles.input}
                />

                <Paragraph style={styles.sectionLabel}>Categories</Paragraph>
                <View style={styles.categoriesContainer}>
                  {categories.map(category => (
                    <Chip
                      key={category}
                      selected={selectedCategories.includes(category)}
                      onPress={() => toggleCategory(category)}
                      style={styles.categoryChip}
                    >
                      {category}
                    </Chip>
                  ))}
                </View>

                <View style={styles.editActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setIsEditing(false)}
                    style={styles.actionButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleSave}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.actionButton}
                  >
                    Save Changes
                  </Button>
                </View>
              </>
            ) : (
              // View Mode
              <>
                <View style={styles.infoRow}>
                  <Icon name="person" size={20} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Paragraph style={styles.infoLabel}>Contact Person</Paragraph>
                    <Paragraph style={styles.infoValue}>{user?.name || 'Not provided'}</Paragraph>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="description" size={20} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Paragraph style={styles.infoLabel}>Description</Paragraph>
                    <Paragraph style={styles.infoValue}>
                      {user?.description || 'No description provided'}
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="phone" size={20} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Paragraph style={styles.infoLabel}>Contact Number</Paragraph>
                    <Paragraph style={styles.infoValue}>
                      {user?.contactNumber || 'Not provided'}
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="language" size={20} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Paragraph style={styles.infoLabel}>Website</Paragraph>
                    <Paragraph style={styles.infoValue}>
                      {user?.website || 'Not provided'}
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="location-on" size={20} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Paragraph style={styles.infoLabel}>Address</Paragraph>
                    <Paragraph style={styles.infoValue}>
                      {user?.address?.street || ''} {user?.address?.city || ''} {user?.address?.state || ''} {user?.address?.zipCode || ''}
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="category" size={20} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Paragraph style={styles.infoLabel}>Categories</Paragraph>
                    <View style={styles.categoriesDisplay}>
                      {user?.categories?.length > 0 ? (
                        user.categories.map(cat => (
                          <Chip key={cat} style={styles.displayChip}>
                            {cat}
                          </Chip>
                        ))
                      ) : (
                        <Paragraph style={styles.infoValue}>No categories selected</Paragraph>
                      )}
                    </View>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Account</Title>
            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              icon="lock"
              onPress={() => navigation.navigate('Security')}
              style={styles.accountButton}
            >
              Security Settings
            </Button>

            <Button
              mode="contained"
              icon="logout"
              onPress={handleLogout}
              style={styles.logoutButton}
              buttonColor="#ef4444"
            >
              Logout
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#1a1d2e',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#8b5cf6',
    marginBottom: 16,
  },
  orgName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    color: '#9ca3af',
    marginBottom: 12,
  },
  verifiedChip: {
    backgroundColor: '#10b98120',
    marginBottom: 8,
  },
  registrationNumber: {
    color: '#6b7280',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#1a1d2e',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
  },
  divider: {
    backgroundColor: '#374151',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
  },
  categoriesDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  displayChip: {
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#0f1117',
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    marginBottom: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  accountButton: {
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 4,
  },
});

export default NGOProfileScreen;