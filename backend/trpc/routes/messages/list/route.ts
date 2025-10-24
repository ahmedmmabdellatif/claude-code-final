import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export interface Message {
  id: number;
  chatId: string;
  senderId: number;
  senderName: string;
  senderRole: 'client' | 'coach';
  message: string;
  timestamp: string;
  timestampMs: number;
  read: boolean;
  attachments?: {
    type: 'image' | 'video' | 'file';
    url: string;
    filename?: string;
  }[];
}

export const messageStore: Map<string, Message[]> = new Map();

const defaultMessages: Message[] = [
  {
    id: 1,
    chatId: 'default',
    senderId: 2,
    senderName: 'Coach Sarah',
    senderRole: 'coach',
    message: "Hey Ahmed! How are you feeling after yesterday's workout?",
    timestamp: '10:30 AM',
    timestampMs: Date.now() - 120000,
    read: true,
  },
  {
    id: 2,
    chatId: 'default',
    senderId: 1,
    senderName: 'Ahmed Hassan',
    senderRole: 'client',
    message: 'Feeling great! The chest workout was intense but I loved it.',
    timestamp: '10:45 AM',
    timestampMs: Date.now() - 105000,
    read: true,
  },
  {
    id: 3,
    chatId: 'default',
    senderId: 2,
    senderName: 'Coach Sarah',
    senderRole: 'coach',
    message: "That's awesome! I saw you completed all sets. Keep up the great work 💪",
    timestamp: '10:47 AM',
    timestampMs: Date.now() - 103000,
    read: true,
  },
  {
    id: 4,
    chatId: 'default',
    senderId: 1,
    senderName: 'Ahmed Hassan',
    senderRole: 'client',
    message: 'Thanks! Quick question - should I add more weight to the incline press next time?',
    timestamp: '10:50 AM',
    timestampMs: Date.now() - 100000,
    read: true,
  },
  {
    id: 5,
    chatId: 'default',
    senderId: 2,
    senderName: 'Coach Sarah',
    senderRole: 'coach',
    message: 'Yes, if you completed all reps comfortably, add 2.5kg next session. Listen to your body though!',
    timestamp: '11:02 AM',
    timestampMs: Date.now() - 88000,
    read: false,
  },
];

messageStore.set('default', defaultMessages);

export const listMessagesProcedure = publicProcedure
  .input(
    z.object({
      chatId: z.string().optional(),
      since: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    const chatId = input.chatId || 'default';
    const messages = messageStore.get(chatId) || [];

    if (input.since !== undefined) {
      return messages.filter(m => m.timestampMs > input.since!);
    }

    return messages;
  });
