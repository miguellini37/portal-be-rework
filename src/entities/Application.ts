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

  @Column({ default: false })
  employerReviewed!: boolean;

  @ManyToOne(() => Interview, { nullable: true })
  interview?: Interview;
}
