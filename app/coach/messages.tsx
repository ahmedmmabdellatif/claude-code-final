import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react-native';
import { Card } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Conversation {
  id: number;
  clientId: number;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    clientId: 1,
    clientName: 'Ahmed Hassan',
    lastMessage: 'Thanks for the tips on my form!',
    lastMessageTime: '10 min ago',
    unreadCount: 2,
    avatar: 'AH',
  },
  {
    id: 2,
    clientId: 2,
    clientName: 'Sarah Mohamed',
    lastMessage: 'Should I increase the weight this week?',
    lastMessageTime: '2 hours ago',
    unreadCount: 1,
    avatar: 'SM',
  },
  {
    id: 3,
    clientId: 3,
    clientName: 'Omar Ali',
    lastMessage: 'Got it! Will start tomorrow.',
    lastMessageTime: '1 day ago',
    unreadCount: 0,
    avatar: 'OA',
  },
  {
    id: 4,
    clientId: 4,
    clientName: 'Fatima Khalil',
    lastMessage: 'Perfect, thanks!',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    avatar: 'FK',
  },
  {
    id: 5,
    clientId: 5,
    clientName: 'Youssef Ibrahim',
    lastMessage: 'Can we adjust my meal plan?',
    lastMessageTime: '3 days ago',
    unreadCount: 1,
    avatar: 'YI',
  },
];

function ConversationCard({ conversation }: { conversation: Conversation }) {
  return (
    <Card
      style={[
        styles.conversationCard,
        conversation.unreadCount > 0 && styles.conversationCardUnread,
      ]}
      onPress={() => {
        router.push({
          pathname: '/coach/chat',
          params: { clientId: conversation.clientId },
        } as never);
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{conversation.avatar}</Text>
        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.clientName}>{conversation.clientName}</Text>
          <Text style={styles.messageTime}>{conversation.lastMessageTime}</Text>
        </View>
        <Text
          style={[
            styles.lastMessage,
            conversation.unreadCount > 0 && styles.lastMessageUnread,
          ]}
          numberOfLines={1}
        >
          {conversation.lastMessage}
        </Text>
      </View>
    </Card>
  );
}

export default function CoachMessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = MOCK_CONVERSATIONS.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {unreadCount > 0 && (
          <View style={styles.unreadSection}>
            <Text style={styles.sectionTitle}>Unread ({unreadCount})</Text>
            {filteredConversations
              .filter((conv) => conv.unreadCount > 0)
              .map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {unreadCount > 0 ? 'All Messages' : 'Recent Conversations'}
          </Text>
          {filteredConversations
            .filter((conv) => unreadCount === 0 || conv.unreadCount === 0)
            .map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
        </View>

        {filteredConversations.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={colors.text.disabled} />
            <Text style={styles.emptyStateTitle}>No conversations found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search query
            </Text>
          </View>
        )}
      </ScrollView>
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
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  headerBadge: {
    backgroundColor: colors.semantic.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
  },
  unreadSection: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  conversationCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  avatarText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.bg.surface,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  clientName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  lastMessage: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  lastMessageUnread: {
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
