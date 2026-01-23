/* src/entities/Activity.ts */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
  RelationId,
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

  @CreateDateColumn({ type: 'timestamp' })
  date!: Date;

  // Unidirectional (no inverse to avoid circular load)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @RelationId((activity: Activity) => activity.user)
  userId!: string;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'applicationId' })
  application?: Application;

  @RelationId((activity: Activity) => activity.application)
  applicationId?: string;

  @ManyToOne(() => Interview, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'interviewId' })
  interview?: Interview;

  @RelationId((activity: Activity) => activity.interview)
  interviewId?: string;
}
