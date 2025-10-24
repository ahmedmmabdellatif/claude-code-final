import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Send, Paperclip } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import hapticFeedback from '@/utils/haptics';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: 'client' | 'coach';
  message: string;
  timestamp: string;
  read: boolean;
}

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

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { user } = useAuth();
  const currentUserId = user?.id || 1;
  const coachId = 2;

  const messagesQuery = trpc.messages.list.useQuery(
    {},
    {
      refetchInterval: 2000,
      refetchIntervalInBackground: false,
    }
  );

  const presenceQuery = trpc.messages.getPresence.useQuery(
    { userId: coachId },
    {
      refetchInterval: 5000,
    }
  );

  const typingQuery = trpc.messages.getTyping.useQuery(
    { chatId: 'default', excludeUserId: currentUserId },
    {
      refetchInterval: 1000,
    }
  );

  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      messagesQuery.refetch();
      setInputText('');
      hapticFeedback.light();
    },
  });

  const setTypingMutation = trpc.messages.setTyping.useMutation();

  const messages = React.useMemo(() => messagesQuery.data || [], [messagesQuery.data]);
  const presence = presenceQuery.data;
  const typing = typingQuery.data;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);

    if (!isTyping && text.trim()) {
      setIsTyping(true);
      setTypingMutation.mutate({
        userId: currentUserId,
        chatId: 'default',
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingMutation.mutate({
        userId: currentUserId,
        chatId: 'default',
        isTyping: false,
      });
    }, 2000);
  }, [isTyping, currentUserId]);

  const handleSend = () => {
    if (inputText.trim()) {
      setIsTyping(false);
      setTypingMutation.mutate({
        userId: currentUserId,
        chatId: 'default',
        isTyping: false,
      });

      sendMessageMutation.mutate({
        message: inputText.trim(),
        senderId: currentUserId,
        senderName: user?.name || 'User',
        senderRole: user?.role || 'client',
      });
    }
  };

  if (messagesQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusText = () => {
    if (typing?.isTyping) {
      return 'typing...';
    }
    if (presence?.status === 'online') {
      return 'Online';
    }
    if (presence?.status === 'away') {
      return 'Away';
    }
    return 'Offline';
  };

  const getStatusColor = () => {
    if (typing?.isTyping) {
      return colors.accent.primary;
    }
    if (presence?.status === 'online') {
      return colors.accent.primary;
    }
    return colors.text.secondary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            {presence?.status === 'online' && (
              <View style={styles.onlineIndicator} />
            )}
            <Text style={styles.avatarText}>CS</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Coach Sarah</Text>
            <Text style={[styles.headerSubtitle, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
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
              isOwn={message.senderId === currentUserId}
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
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, (!inputText.trim() || sendMessageMutation.isPending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <Send
                size={20}
                color={inputText.trim() ? colors.text.primary : colors.text.disabled}
              />
            )}
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
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF00',
    borderWidth: 2,
    borderColor: colors.bg.dark,
    zIndex: 1,
  },
  avatarText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold as '600',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.size.small,
    marginTop: 2,
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
