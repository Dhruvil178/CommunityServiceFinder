import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    setMessages([
      { id: '0', sender: 'bot', text: '🧙 Quest Master ready. Ask me how to earn XP.' }
    ]);
  }, []);

  const send = () => {
    if (!text) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text },
      { id: Date.now() + 'b', sender: 'bot', text: '⚡ +5 XP for staying curious!' }
    ]);
    setText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <Text style={[
            styles.msg,
            item.sender === 'user' ? styles.user : styles.bot
          ]}>
            {item.text}
          </Text>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} />
        <TouchableOpacity onPress={send}><Text style={styles.send}>Send</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  msg: { margin: 8, padding: 12, borderRadius: 12 },
  user: { alignSelf: 'flex-end', backgroundColor: '#8b5cf6', color: '#fff' },
  bot: { alignSelf: 'flex-start', backgroundColor: '#1a1d2e', color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12 },
  send: { marginLeft: 8, color: '#8b5cf6', fontWeight: 'bold' },
});

export default ChatbotScreen;
