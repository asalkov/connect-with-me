import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastMessageAt: Date;

  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
