import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './Company';
import { CompanyEmployee } from './CompanyEmployee'; // assuming this is your owner employee entity

export enum JobStatus {
  open = 'open',
  closed = 'closed',
  filled = 'filled',
}

export enum JobType {
  INTERNSHIP = 'internship',
  JOB = 'job',
  NIL = 'nil',
}

@Entity()
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Company, { nullable: true })
  company?: Company;

  @ManyToOne(() => CompanyEmployee, { nullable: true })
  owner?: CompanyEmployee; // the employee who created/owns this job

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  experience?: string;

  @CreateDateColumn()
  createdDate!: Date;

  @Column({ type: 'date', nullable: true })
  applicationDeadline?: Date;

  @Column({ nullable: true })
  benefits?: string;

  @Column({ nullable: true })
  type?: JobType;

  @Column({ nullable: true })
  requirements?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  salary?: number;

  // Not yet implemented
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  paymentType?: string; // e.g., hourly, stipend, unpaid

  @Column({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  athleteBenefits?: string;

  @Column({ nullable: true })
  status?: JobStatus;
}
