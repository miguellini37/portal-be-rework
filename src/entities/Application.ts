import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { Job } from './Job';
import { Athlete } from './Athlete';
import { Interview } from './Interview';

export enum ApplicationStatus {
  applied = 'applied',
  under_review = 'under_review',
  interview_requested = 'interview_requested',
  accepted = 'accepted',
  rejected = 'rejected',
  withdrawn = 'withdrawn',
}

export const TERMINAL_STATUSES = [
  ApplicationStatus.accepted,
  ApplicationStatus.rejected,
  ApplicationStatus.withdrawn,
];

@Entity()
export class Application extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Job, { nullable: false })
  job!: Job;

  @ManyToOne(() => Athlete, { nullable: false })
  athlete!: Athlete;

  @CreateDateColumn()
  creationDate!: Date;

  @Column({ type: 'date', nullable: true })
  terminalStatusDate?: Date;

  @Column({ default: false })
  employerReviewed!: boolean;

  @ManyToOne(() => Interview, { nullable: true })
  interview?: Interview;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.applied })
  status!: ApplicationStatus;
}
