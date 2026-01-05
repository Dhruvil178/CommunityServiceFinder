// src/screens/ngo/CreateEventScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, Chip, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, updateEvent } from '../../store/ngoSlice';

const CreateEventScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector(state => state.ngo);
  
  const existingEvent = route.params?.event;
  const isEditing = !!existingEvent;

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environmental');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [spotsTotal, setSpotsTotal] = useState('');
  const [xpReward, setXpReward] = useState('50');
  const [coinsReward, setCoinsReward] = useState('10');
  const [image, setImage] = useState('');
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [tags, setTags] = useState([]);

  // Skill input
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'Environmental',
    'Education',
    'Health',
    'Community Support',
    'Animal Welfare',
    'Technology'
  ];

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title || '');
      setDescription(existingEvent.description || '');
      setCategory(existingEvent.category || 'Environmental');
      setCity(existingEvent.city || '');
      setLocation(existingEvent.location || '');
      setDate(existingEvent.date || '');
      setTime(existingEvent.time || '');
      setDuration(existingEvent.duration || '');
      setSpotsTotal(existingEvent.spotsTotal?.toString() || '');
      setXpReward(existingEvent.xpReward?.toString() || '50');
      setCoinsReward(existingEvent.coinsReward?.toString() || '10');
      setImage(existingEvent.image || '');
      setSkillsRequired(existingEvent.skillsRequired || []);
      setTags(existingEvent.tags || []);
    }
  }, [existingEvent]);

  const addSkill = () => {
    if (skillInput.trim() && !skillsRequired.includes(skillInput.trim())) {
      setSkillsRequired([...skillsRequired, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkillsRequired(skillsRequired.filter(s => s !== skill));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter event title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter event description');
      return false;
    }
    if (!city.trim() || !location.trim()) {
      Alert.alert('Error', 'Please enter event location');
      return false;
    }
    if (!date.trim() || !time.trim()) {
      Alert.alert('Error', 'Please enter event date and time');
      return false;
    }
    if (!duration.trim()) {
      Alert.alert('Error', 'Please enter event duration');
      return false;
    }
    if (!spotsTotal || parseInt(spotsTotal) < 1) {
      Alert.alert('Error', 'Please enter valid number of spots');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      category,
      city: city.trim(),
      location: location.trim(),
      date: date.trim(),
      time: time.trim(),
      duration: duration.trim(),
      spotsTotal: parseInt(spotsTotal),
      xpReward: parseInt(xpReward) || 50,
      coinsReward: parseInt(coinsReward) || 10,
      image: image.trim() || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
      skillsRequired,
      tags,
      status: 'upcoming'
    };

    try {
      if (isEditing) {
        await dispatch(updateEvent({ 
          eventId: existingEvent._id, 
          updates: eventData 
        })).unwrap();
        Alert.alert('Success', 'Event updated successfully!');
      } else {
        await dispatch(createEvent(eventData)).unwrap();
        Alert.alert('Success', 'Event created successfully!');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to save event');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Title style={styles.title}>
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </Title>

          {/* Basic Information */}
          <Paragraph style={styles.sectionLabel}>Basic Information</Paragraph>

          <TextInput
            label="Event Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Beach Cleanup Drive"
          />

          <TextInput
            label="Description *"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Describe your event..."
          />

          {/* Category */}
          <Paragraph style={styles.sectionLabel}>Category *</Paragraph>
          <View style={styles.categoriesContainer}>
            {categories.map(cat => (
              <Chip
                key={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
                style={styles.categoryChip}
              >
                {cat}
              </Chip>
            ))}
          </View>

          {/* Location & Date */}
          <Paragraph style={styles.sectionLabel}>Location & Date</Paragraph>

          <TextInput
            label="City *"
            value={city}
            onChangeText={setCity}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Mumbai"
          />

          <TextInput
            label="Location Address *"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Juhu Beach, Mumbai"
          />

          <TextInput
            label="Date * (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            style={styles.input}
            placeholder="2025-08-15"
          />

          <TextInput
            label="Time * (HH:MM AM/PM)"
            value={time}
            onChangeText={setTime}
            mode="outlined"
            style={styles.input}
            placeholder="09:00 AM"
          />

          <TextInput
            label="Duration *"
            value={duration}
            onChangeText={setDuration}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., 4 hours"
          />

          {/* Volunteer Spots */}
          <Paragraph style={styles.sectionLabel}>Volunteer Management</Paragraph>

          <TextInput
            label="Total Spots Available *"
            value={spotsTotal}
            onChangeText={setSpotsTotal}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            placeholder="e.g., 50"
          />

          {/* Rewards */}
          <Paragraph style={styles.sectionLabel}>Gamification Rewards</Paragraph>

          <TextInput
            label="XP Reward"
            value={xpReward}
            onChangeText={setXpReward}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            placeholder="50"
          />

          <TextInput
            label="Coins Reward"
            value={coinsReward}
            onChangeText={setCoinsReward}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            placeholder="10"
          />

          {/* Skills Required */}
          <Paragraph style={styles.sectionLabel}>Skills Required (Optional)</Paragraph>
          
          <View style={styles.chipInputContainer}>
            <TextInput
              label="Add Skill"
              value={skillInput}
              onChangeText={setSkillInput}
              mode="outlined"
              style={styles.chipInput}
              placeholder="e.g., Communication"
            />
            <Button mode="contained" onPress={addSkill} style={styles.addButton}>
              Add
            </Button>
          </View>

          <View style={styles.chipsDisplay}>
            {skillsRequired.map(skill => (
              <Chip
                key={skill}
                onClose={() => removeSkill(skill)}
                style={styles.displayChip}
              >
                {skill}
              </Chip>
            ))}
          </View>

          {/* Tags */}
          <Paragraph style={styles.sectionLabel}>Tags (Optional)</Paragraph>
          
          <View style={styles.chipInputContainer}>
            <TextInput
              label="Add Tag"
              value={tagInput}
              onChangeText={setTagInput}
              mode="outlined"
              style={styles.chipInput}
              placeholder="e.g., environment"
            />
            <Button mode="contained" onPress={addTag} style={styles.addButton}>
              Add
            </Button>
          </View>

          <View style={styles.chipsDisplay}>
            {tags.map(tag => (
              <Chip
                key={tag}
                onClose={() => removeTag(tag)}
                style={styles.displayChip}
              >
                {tag}
              </Chip>
            ))}
          </View>

          {/* Image URL */}
          <Paragraph style={styles.sectionLabel}>Event Image (Optional)</Paragraph>
          
          <TextInput
            label="Image URL"
            value={image}
            onChangeText={setImage}
            mode="outlined"
            style={styles.input}
            placeholder="https://example.com/image.jpg"
          />

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          >
            {isEditing ? 'Update Event' : 'Create Event'}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#1a1d2e',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  chipInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chipInput: {
    flex: 1,
    backgroundColor: '#1a1d2e',
  },
  addButton: {
    marginTop: 8,
  },
  chipsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  displayChip: {
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default CreateEventScreen;