/* src/entities/Activity.ts */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { User } from './User';
import { Application } from './Application';
import { Interview } from './Interview';

export enum ActivityType {
  APPLICATION = 'application',
  INTERVIEW = 'interview',
  OTHER = 'other',
}

@Entity()
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  activityId!: string;

  @Column({ type: 'simple-enum', enum: ActivityType, default: ActivityType.OTHER })
  type!: ActivityType;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @CreateDateColumn()
  date!: Date;

  // Unidirectional (no inverse to avoid circular load)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'SET NULL' })
  application?: Application;

  @ManyToOne(() => Interview, { nullable: true, onDelete: 'SET NULL' })
  interview?: Interview;
}
