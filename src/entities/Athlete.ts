import { Column, ManyToOne, ChildEntity } from 'typeorm';
import { User } from './User';
import { School } from './School';

@ChildEntity()
export class Athlete extends User {
  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  sport?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  school?: string;

  @Column({ nullable: true })
  major?: string;

  @Column({ type: 'float', nullable: true })
  gpa?: number;

  @Column({ nullable: true })
  division?: string;

  @Column({ nullable: true })
  accolades?: string;

  @Column({ nullable: true })
  teamRole?: string;

  @Column({ nullable: true })
  coachability?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ type: 'date', nullable: true })
  graduationDate?: Date;

  @Column({ type: 'int', nullable: true })
  points?: number;

  @Column({ type: 'int', nullable: true })
  assists?: number;

  @Column({ nullable: true })
  jobTitle?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-array', nullable: true })
  internshipIds?: number[];

  @ManyToOne(() => School, { nullable: true })
  schoolRef?: School;
}
