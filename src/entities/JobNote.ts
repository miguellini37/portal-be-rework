import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Job } from './Job';
import { Athlete } from './Athlete';

@Entity()
export class JobNote extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Job, { nullable: false })
  job!: Job;

  @ManyToOne(() => Athlete, { nullable: false })
  athlete!: Athlete;

  @Column({ type: 'text', nullable: false })
  note!: string;
}
