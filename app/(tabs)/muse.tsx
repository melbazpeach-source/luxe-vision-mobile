import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function MuseScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#333' }, 'icon');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm Muse, your AI Creative Director. I can help you refine prompts, suggest variations, analyze images, and guide your creative process. How can I assist you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMuseResponse(userMessage.content),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const generateMuseResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('prompt') || lowerInput.includes('suggest')) {
      return "Here are 3 prompt variations for you:\n\n1. \"A futuristic cityscape at golden hour, with flying cars and neon lights, cinematic composition, 8K ultra detailed\"\n\n2. \"Cyberpunk metropolis during sunset, aerial view, volumetric lighting, photorealistic rendering\"\n\n3. \"Neo-Tokyo inspired city at dusk, dramatic sky, ray-traced reflections, architectural photography style\"";
    }

    if (lowerInput.includes('refine') || lowerInput.includes('improve')) {
      return "To refine your prompt, consider adding:\n\n• Specific lighting (golden hour, studio lighting, dramatic shadows)\n• Art style (photorealistic, cinematic, oil painting)\n• Camera angle (aerial view, close-up, wide shot)\n• Quality modifiers (8K, ultra detailed, high resolution)\n• Mood descriptors (serene, dramatic, mysterious)";
    }

    if (lowerInput.includes('analyze') || lowerInput.includes('image')) {
      return "To analyze an image, please upload it in the Studio tab and select 'Analyze' mode. I can help you understand composition, color palette, lighting, and suggest improvements or variations.";
    }

    return "I'm here to help with your creative projects! You can ask me to:\n\n• Suggest prompt variations\n• Refine existing prompts\n• Analyze images\n• Recommend settings\n• Provide creative direction\n\nWhat would you like to explore?";
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isUser
            ? { backgroundColor: tintColor }
            : { backgroundColor: borderColor, opacity: 0.3 },
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            isUser && { color: '#fff' },
          ]}
        >
          {item.content}
        </ThemedText>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 16),
              borderBottomColor: borderColor,
            },
          ]}
        >
          <ThemedText type="title" style={styles.title}>
            Muse AI
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your Creative Director
          </ThemedText>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: Math.max(insets.bottom + 80, 100) },
          ]}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.typingIndicator, { backgroundColor: borderColor, opacity: 0.3 }]}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={styles.typingText}>Muse is thinking...</ThemedText>
          </View>
        )}

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor,
              borderTopColor: borderColor,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor, color: textColor, borderColor },
            ]}
            placeholder="Ask Muse for creative guidance..."
            placeholderTextColor={borderColor}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            style={[
              styles.sendButton,
              { backgroundColor: tintColor },
              (!input.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
          >
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
