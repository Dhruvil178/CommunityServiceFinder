// src/screens/ngo/CreateEventScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import {
  TextInput, Button, Title, Paragraph, Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, updateEvent } from '../../store/ngoSlice';

const CATEGORIES = [
  'Environmental', 'Education', 'Health',
  'Community Support', 'Animal Welfare', 'Technology',
];

const CreateEventScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector(state => state.ngo);

  const existingEvent = route.params?.event;
  const isEditing = !!existingEvent;

  // ── Form state ────────────────────────────────────────────────────────────
  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [category, setCategory]     = useState('Environmental');
  const [city, setCity]             = useState('');
  const [location, setLocation]     = useState('');
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('');
  const [duration, setDuration]     = useState('');
  const [spotsTotal, setSpotsTotal] = useState('');
  const [xpReward, setXpReward]     = useState('50');
  const [coinsReward, setCoins]     = useState('10');
  const [image, setImage]           = useState('');
  const [skills, setSkills]         = useState([]);
  const [tags, setTags]             = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput]     = useState('');

  // ── Pre-fill when editing ─────────────────────────────────────────────────
  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title || '');
      setDesc(existingEvent.description || '');
      setCategory(existingEvent.category || 'Environmental');
      setCity(existingEvent.city || '');
      setLocation(existingEvent.location || '');
      setDate(existingEvent.date || '');
      setTime(existingEvent.time || '');
      setDuration(existingEvent.duration || '');
      setSpotsTotal(existingEvent.spotsTotal?.toString() || '');
      setXpReward(existingEvent.xpReward?.toString() || '50');
      setCoins(existingEvent.coinsReward?.toString() || '10');
      setImage(existingEvent.image || '');
      setSkills(existingEvent.skillsRequired || []);
      setTags(existingEvent.tags || []);
    }
  }, [existingEvent]);

  // ── Chip helpers ──────────────────────────────────────────────────────────
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(''); }
  };
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(''); }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!title.trim())                         { Alert.alert('Missing', 'Event title is required'); return false; }
    if (!description.trim())                   { Alert.alert('Missing', 'Description is required'); return false; }
    if (!city.trim() || !location.trim())      { Alert.alert('Missing', 'City and location are required'); return false; }
    if (!date.trim() || !time.trim())          { Alert.alert('Missing', 'Date and time are required'); return false; }
    if (!duration.trim())                      { Alert.alert('Missing', 'Duration is required'); return false; }
    const spots = parseInt(spotsTotal);
    if (!spots || spots < 1)                   { Alert.alert('Missing', 'Enter a valid number of spots'); return false; }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const spots = parseInt(spotsTotal);

    const eventData = {
      title:           title.trim(),
      description:     description.trim(),
      category,
      city:            city.trim(),
      location:        location.trim(),
      date:            date.trim(),
      time:            time.trim(),
      duration:        duration.trim(),
      spotsTotal:      spots,
      // FIX: spotsAvailable must equal spotsTotal on creation
      // (it decreases as students register)
      spotsAvailable:  isEditing ? existingEvent.spotsAvailable : spots,
      xpReward:        parseInt(xpReward) || 50,
      coinsReward:     parseInt(coinsReward) || 10,
      image:           image.trim() ||
        'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
      skillsRequired:  skills,
      tags,
      status:          'upcoming',
    };

    try {
      if (isEditing) {
        await dispatch(updateEvent({ eventId: existingEvent._id, updates: eventData })).unwrap();
        Alert.alert('✅ Updated', 'Event updated successfully!');
      } else {
        await dispatch(createEvent(eventData)).unwrap();
        Alert.alert('✅ Created', 'Event created successfully! Students can now register.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', typeof error === 'string' ? error : 'Failed to save event. Check your connection.');
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <Title style={s.pageTitle}>
            {isEditing ? '✏️ Edit Event' : '🎉 Create New Event'}
          </Title>

          {/* ── Basic info ── */}
          <SectionLabel text="Basic Information" />
          <TextInput label="Event Title *" value={title} onChangeText={setTitle}
            mode="outlined" style={s.input} placeholder="e.g., Beach Cleanup Drive" />
          <TextInput label="Description *" value={description} onChangeText={setDesc}
            mode="outlined" multiline numberOfLines={4} style={s.input}
            placeholder="Describe your event and what volunteers will do..." />

          {/* ── Category ── */}
          <SectionLabel text="Category *" />
          <View style={s.chips}>
            {CATEGORIES.map(cat => (
              <Chip key={cat} selected={category === cat}
                onPress={() => setCategory(cat)} style={s.chip}>
                {cat}
              </Chip>
            ))}
          </View>

          {/* ── Location & date ── */}
          <SectionLabel text="Location & Date" />
          <TextInput label="City *" value={city} onChangeText={setCity}
            mode="outlined" style={s.input} placeholder="e.g., Mumbai" />
          <TextInput label="Full Address *" value={location} onChangeText={setLocation}
            mode="outlined" style={s.input} placeholder="e.g., Juhu Beach, Mumbai" />
          <TextInput label="Date * (YYYY-MM-DD)" value={date} onChangeText={setDate}
            mode="outlined" style={s.input} placeholder="2025-08-15" />
          <TextInput label="Time * (e.g. 09:00 AM)" value={time} onChangeText={setTime}
            mode="outlined" style={s.input} placeholder="09:00 AM" />
          <TextInput label="Duration *" value={duration} onChangeText={setDuration}
            mode="outlined" style={s.input} placeholder="e.g., 4 hours" />

          {/* ── Spots ── */}
          <SectionLabel text="Volunteer Spots" />
          <TextInput label="Total Spots Available *" value={spotsTotal}
            onChangeText={setSpotsTotal} mode="outlined" keyboardType="number-pad"
            style={s.input} placeholder="e.g., 50" />

          {/* ── Gamification rewards ── */}
          <SectionLabel text="Gamification Rewards" />
          <View style={s.row}>
            <TextInput label="XP Reward" value={xpReward} onChangeText={setXpReward}
              mode="outlined" keyboardType="number-pad" style={[s.input, s.halfInput]} />
            <TextInput label="Coins Reward" value={coinsReward} onChangeText={setCoins}
              mode="outlined" keyboardType="number-pad" style={[s.input, s.halfInput]} />
          </View>

          {/* ── Skills ── */}
          <SectionLabel text="Skills Required (Optional)" />
          <View style={s.chipInputRow}>
            <TextInput label="Add Skill" value={skillInput} onChangeText={setSkillInput}
              mode="outlined" style={s.chipInput} placeholder="e.g., Communication" />
            <Button mode="contained" onPress={addSkill} style={s.addBtn}>Add</Button>
          </View>
          <View style={s.chips}>
            {skills.map(sk => (
              <Chip key={sk} onClose={() => setSkills(skills.filter(x => x !== sk))}
                style={s.chip}>{sk}</Chip>
            ))}
          </View>

          {/* ── Tags ── */}
          <SectionLabel text="Tags (Optional)" />
          <View style={s.chipInputRow}>
            <TextInput label="Add Tag" value={tagInput} onChangeText={setTagInput}
              mode="outlined" style={s.chipInput} placeholder="e.g., environment" />
            <Button mode="contained" onPress={addTag} style={s.addBtn}>Add</Button>
          </View>
          <View style={s.chips}>
            {tags.map(tg => (
              <Chip key={tg} onClose={() => setTags(tags.filter(x => x !== tg))}
                style={s.chip}>{tg}</Chip>
            ))}
          </View>

          {/* ── Image ── */}
          <SectionLabel text="Event Image (Optional)" />
          <TextInput label="Image URL" value={image} onChangeText={setImage}
            mode="outlined" style={s.input} placeholder="https://example.com/image.jpg"
            autoCapitalize="none" />

          {/* ── Submit ── */}
          <Button mode="contained" onPress={handleSubmit}
            loading={isLoading} disabled={isLoading} style={s.submitBtn}>
            {isEditing ? 'Update Event' : 'Create Event'}
          </Button>
          <Button mode="text" onPress={() => navigation.goBack()} style={s.cancelBtn}>
            Cancel
          </Button>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const SectionLabel = ({ text }) => (
  <Paragraph style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 18, marginBottom: 10 }}>
    {text}
  </Paragraph>
);

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0f1117' },
  scroll:       { padding: 20, paddingBottom: 48 },
  pageTitle:    { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  input:        { marginBottom: 12, backgroundColor: '#1a1d2e' },
  row:          { flexDirection: 'row', gap: 10 },
  halfInput:    { flex: 1 },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip:         { marginBottom: 4 },
  chipInputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 },
  chipInput:    { flex: 1, backgroundColor: '#1a1d2e' },
  addBtn:       { marginTop: 6 },
  submitBtn:    { marginTop: 28, paddingVertical: 6, backgroundColor: '#7c3aed' },
  cancelBtn:    { marginTop: 8 },
});

export default CreateEventScreen;