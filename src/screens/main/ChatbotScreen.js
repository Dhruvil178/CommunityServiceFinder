// src/screens/main/ChatbotScreen.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants';

// ── Quick suggestion chips shown before first message ─────────────────────────
const SUGGESTIONS = [
  { id: 'reg',   label: '📋 How to register?',       msg: 'How do I register for an event?' },
  { id: 'cert',  label: '🎓 How do certs work?',      msg: 'How do I get my certificate?' },
  { id: 'xp',    label: '⚡ How to earn XP?',          msg: 'How does the XP and levelling system work?' },
  { id: 'cal',   label: '📅 View my events',           msg: 'Where can I see the events I registered for?' },
  { id: 'near',  label: '📍 Find events near me',      msg: "I can't find any events near me. What should I do?" },
  { id: 'level', label: '🏆 What are achievements?',   msg: 'Tell me about the achievements and badges.' },
];

// ── Individual message bubble ─────────────────────────────────────────────────
const MessageBubble = ({ item }) => {
  const isUser = item.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {!isUser && (
        <LinearGradient colors={['#7c3aed', '#ec4899']} style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🧙</Text>
        </LinearGradient>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
          {item.content}
        </Text>
        <Text style={styles.bubbleTime}>
          {new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

// ── Typing indicator (3 dots) ─────────────────────────────────────────────────
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const anim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    anim(dot1, 0);
    anim(dot2, 150);
    anim(dot3, 300);
  }, []);

  return (
    <View style={styles.typingRow}>
      <LinearGradient colors={['#7c3aed', '#ec4899']} style={styles.botAvatar}>
        <Text style={styles.botAvatarText}>🧙</Text>
      </LinearGradient>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ChatbotScreen() {
  const { token, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();

  // Messages stored as [{ role, content, timestamp }]
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${user?.name?.split(' ')[0] || 'there'}! ⚡ I'm Quest Master, your guide to volunteering greatness. Ask me anything about events, XP, certificates, or how the app works!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const listRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    setInput('');
    setShowSuggestions(false);

    const userMsg = { role: 'user', content: trimmed, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);
    scrollToBottom();

    try {
      // Build history in the format Claude expects (role + content only)
      const history = newMessages.map(m => ({ role: m.role, content: m.content }));
      // Remove the last user message since we pass it as `message`
      history.pop();

      const { data } = await axios.post(
        `${API_BASE_URL}/api/chatbot/chat`,
        { message: trimmed, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply, timestamp: Date.now() },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Check your internet and try again! 🔧",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }, [input, messages, isTyping, token]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* ── Messages list ─────────────────────────────── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={
            <>
              {isTyping && <TypingIndicator />}

              {/* Quick suggestions — shown only before user sends first message */}
              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsLabel}>Quick questions</Text>
                  <View style={styles.suggestions}>
                    {SUGGESTIONS.map(s => (
                      <TouchableOpacity
                        key={s.id}
                        style={styles.suggestionChip}
                        onPress={() => sendMessage(s.msg)}
                      >
                        <Text style={styles.suggestionText}>{s.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />

        {/* ── Input bar ─────────────────────────────────── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Quest Master anything..."
            placeholderTextColor="#555"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            style={styles.sendBtn}
          >
            <LinearGradient
              colors={input.trim() && !isTyping ? ['#7c3aed', '#ec4899'] : ['#374151', '#374151']}
              style={styles.sendGrad}
            >
              {isTyping
                ? <ActivityIndicator size="small" color="#fff" />
                : <Icon name="send" size={20} color="#fff" />
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },

  list: { padding: 12, paddingBottom: 8 },

  // Message bubbles
  bubbleRow:     { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubbleRowBot:  { alignSelf: 'flex-start' },

  botAvatar: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, alignSelf: 'flex-end',
  },
  botAvatarText: { fontSize: 18 },

  bubble:          { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  bubbleUser:      { backgroundColor: '#7c3aed', borderBottomRightRadius: 4 },
  bubbleBot:       { backgroundColor: '#1a1d2e', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#2d3148' },
  bubbleText:      { fontSize: 15, lineHeight: 22 },
  bubbleTextUser:  { color: '#fff' },
  bubbleTextBot:   { color: '#e5e7eb' },
  bubbleTime:      { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' },

  // Typing indicator
  typingRow:    { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, paddingHorizontal: 12 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1a1d2e', borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#2d3148',
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#7c3aed' },

  // Suggestions
  suggestionsContainer: { paddingHorizontal: 4, marginTop: 8, marginBottom: 4 },
  suggestionsLabel: { color: '#4b5563', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  suggestions:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    backgroundColor: '#1a1d2e', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#2d3148',
  },
  suggestionText: { color: '#a78bfa', fontSize: 13 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 10, gap: 8,
    borderTopWidth: 1, borderTopColor: '#1a1d2e',
    backgroundColor: '#0f1117',
  },
  textInput: {
    flex: 1, backgroundColor: '#1a1d2e',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', fontSize: 15, maxHeight: 120,
    borderWidth: 1, borderColor: '#2d3148',
  },
  sendBtn:  { marginBottom: 2 },
  sendGrad: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});