import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef(null);

  const pushMessage = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), ...msg }]);
    setTimeout(() => {
      flatRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const BotTyping = () => (
    <View style={{ flexDirection: "row", padding: 10 }}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </View>
  );

  const handleSend = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    pushMessage({ from: "user", text });
    setInput("");

    setIsTyping(true);

    const lower = text.toLowerCase();
    let intent = "fallback";

    if (lower.includes("recommend")) intent = "recommend";
    else if (lower.includes("register")) intent = "register_help";

    if (intent === "recommend") {
      try {
        const res = await fetch("http://<YOUR_BACKEND_URL>/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage: text })
        });

        setIsTyping(false);
        const data = await res.json();

        if (!res.ok) {
          pushMessage({ from: "bot", text: "Sorry, I couldn't fetch recommendations." });
          return;
        }

        if (Array.isArray(data.recommendations) && data.recommendations.length) {
          for (const rec of data.recommendations) {
            const ev = rec.event;
            pushMessage({
              from: "bot",
              text: `${ev.title} — ${ev.date}\n${rec.reason}`
            });
          }
          pushMessage({ from: "bot", text: "Tap any event title to view details." });
        } else {
          pushMessage({ from: "bot", text: "No matching events found. Try broadening your preferences." });
        }
      } catch (err) {
        setIsTyping(false);
        pushMessage({ from: "bot", text: "Network error. Try again later." });
      }

    } else if (intent === "register_help") {
      setIsTyping(false);
      pushMessage({
        from: "bot",
        text: "To register, open an event and tap *Register*. If you want, I can register for you — just provide the event ID."
      });

    } else {

      setIsTyping(false);

      const canned = {
        "hi": "Hey! How can I assist you today?",
        "hello": "Hello! Looking for volunteer events?",
        "what can you do": "I can recommend events, help with registrations, and guide you about certificates."
      };

      const reply =
        canned[lower] || "Try asking: 'Recommend events for me'.";

      pushMessage({ from: "bot", text: reply });
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        marginVertical: 6,
        alignSelf: item.from === "user" ? "flex-end" : "flex-start",
        maxWidth: "85%",
      }}
    >
      <View
        style={{
          backgroundColor: item.from === "user" ? "#007bff" : "#222",
          padding: 12,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#fff" }}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Chat List */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Typing Animation */}
      {isTyping && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <View style={{ alignSelf: "flex-start", backgroundColor: "#222", borderRadius: 10 }}>
            <BotTyping />
          </View>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Ask something..."
          placeholderTextColor="#777"
          value={input}
          onChangeText={setInput}
          style={styles.input}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={{ color: "white", fontWeight: "700" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },

  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#222",
    backgroundColor: "#0D0D0D"
  },

  input: {
    flex: 1,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    color: "white",
  },

  sendBtn: {
    backgroundColor: "#1E90FF",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 3,
    opacity: 0.5,
  },
});
