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
import { Job } from './Job';
import { Athlete } from './Athlete';
import { Application } from './Application';
import { Company } from './Company';

export enum InterviewStatus {
  scheduled = 'scheduled',
  cancelled = 'cancelled',
  complete = 'complete',
}

@Entity()
export class Interview extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp', nullable: false })
  dateTime!: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  interviewer?: string;

  @Column({ nullable: true })
  preparationTips?: string;

  @Column({ type: 'enum', enum: InterviewStatus, default: InterviewStatus.scheduled })
  status!: InterviewStatus;

  @CreateDateColumn()
  creationDate!: Date;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'jobId' })
  job!: Job;

  @RelationId((interview: Interview) => interview.job)
  jobId!: string;

  @ManyToOne(() => Application, { nullable: false })
  @JoinColumn({ name: 'applicationId' })
  application!: Application;

  @RelationId((interview: Interview) => interview.application)
  applicationId!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @RelationId((interview: Interview) => interview.company)
  companyId!: string;

  @ManyToOne(() => Athlete, { nullable: false })
  @JoinColumn({ name: 'athleteId' })
  athlete!: Athlete;

  @RelationId((interview: Interview) => interview.athlete)
  athleteId!: string;
}
