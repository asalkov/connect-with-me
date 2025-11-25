import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'text',
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({
    type: 'text',
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  fileMimeType: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}
