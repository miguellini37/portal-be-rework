import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
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

  @ManyToOne(() => Job, { nullable: false })
  job!: Job;

  @ManyToOne(() => Application, { nullable: false })
  application!: Application;

  @ManyToOne(() => Company, { nullable: false })
  company!: Company;

  @ManyToOne(() => Athlete, { nullable: false })
  athlete!: Athlete;

  @CreateDateColumn()
  creationDate!: Date;
}
