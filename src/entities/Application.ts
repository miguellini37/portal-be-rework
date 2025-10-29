import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  BaseEntity,
  RelationId,
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

  @CreateDateColumn()
  creationDate!: Date;

  @Column({ type: 'date', nullable: true })
  terminalStatusDate?: Date;

  @Column({ default: false })
  employerReviewed!: boolean;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.applied })
  status!: ApplicationStatus;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'jobId' })
  job!: Job;

  @RelationId((application: Application) => application.job)
  jobId!: string;

  @ManyToOne(() => Athlete, { nullable: false })
  @JoinColumn({ name: 'athleteId' })
  athlete!: Athlete;

  @RelationId((application: Application) => application.athlete)
  athleteId!: string;

  @ManyToOne(() => Interview, { nullable: true })
  @JoinColumn({ name: 'interviewId' })
  interview?: Interview;

  @RelationId((application: Application) => application.interview)
  interviewId?: string;
}
