export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  participants: string[];
  createdBy?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}
