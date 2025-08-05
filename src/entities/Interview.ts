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

  @ManyToOne(() => Job, { nullable: false })
  job!: Job;

  @ManyToOne(() => Athlete, { nullable: false })
  athlete!: Athlete;

  @CreateDateColumn()
  creationDate!: Date;
}
