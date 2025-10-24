import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Paperclip, User } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Message {
  id: number;
  senderId: number;
  senderRole: 'client' | 'coach';
  message: string;
  timestamp: string;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    senderId: 1,
    senderRole: 'client',
    message: 'Hi Coach! I had a question about my form on the bench press.',
    timestamp: '10:30 AM',
  },
  {
    id: 2,
    senderId: 2,
    senderRole: 'coach',
    message: 'Hey Ahmed! Sure, what\'s the issue?',
    timestamp: '10:32 AM',
  },
  {
    id: 3,
    senderId: 1,
    senderRole: 'client',
    message: 'I feel like my elbows are flaring out too much. Should they be closer to my body?',
    timestamp: '10:33 AM',
  },
  {
    id: 4,
    senderId: 2,
    senderRole: 'coach',
    message: 'Good catch! Yes, keep your elbows at about 45 degrees from your body. This protects your shoulders and engages your chest better.',
    timestamp: '10:35 AM',
  },
  {
    id: 5,
    senderId: 2,
    senderRole: 'coach',
    message: 'Also make sure you\'re retracting your shoulder blades and keeping them pinned to the bench throughout the movement.',
    timestamp: '10:35 AM',
  },
  {
    id: 6,
    senderId: 1,
    senderRole: 'client',
    message: 'Thanks for the tips on my form!',
    timestamp: '10:45 AM',
  },
];

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View style={[styles.messageContainer, isOwn && styles.messageContainerOwn]}>
      <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
        <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
          {message.message}
        </Text>
        <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

export default function CoachChatScreen() {
  const params = useLocalSearchParams();
  const clientId = params.clientId ? Number(params.clientId) : 1;

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        senderId: 2,
        senderRole: 'coach',
        message: inputText.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      };

      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  const clientName = 'Ahmed Hassan';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AH</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{clientName}</Text>
            <Pressable
              onPress={() => {
                router.push({
                  pathname: '/coach/client-profile',
                  params: { id: clientId },
                } as never);
              }}
            >
              <Text style={styles.headerSubtitle}>View Profile</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          style={styles.profileButton}
          onPress={() => {
            router.push({
              pathname: '/coach/client-profile',
              params: { id: clientId },
            } as never);
          }}
        >
          <User size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderRole === 'coach'}
            />
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <Pressable style={styles.attachButton}>
            <Paperclip size={24} color={colors.text.secondary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send
              size={20}
              color={inputText.trim() ? colors.text.primary : colors.text.disabled}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.screen,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.progress.bg,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.size.small,
    color: colors.accent.primary,
    marginTop: 2,
  },
  profileButton: {
    padding: spacing.sm,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.screen,
    paddingBottom: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  messageContainerOwn: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: spacing.md,
  },
  messageBubbleOwn: {
    backgroundColor: colors.accent.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: typography.size.body,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  messageTextOwn: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  messageTimeOwn: {
    color: colors.text.primary,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.progress.bg,
    backgroundColor: colors.bg.dark,
  },
  attachButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.size.body,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.accent.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.progress.bg,
  },
});
