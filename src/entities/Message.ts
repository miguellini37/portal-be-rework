import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  conversationId!: string;

  @Column({ type: 'varchar', length: 255 })
  fromUserId!: string;

  @Column({ type: 'varchar', length: 255 })
  toUserId!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'datetime', nullable: true })
  readAt?: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'fromUserId' })
  fromUser?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'toUserId' })
  toUser?: User;
}
