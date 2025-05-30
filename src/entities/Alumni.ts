import { ChildEntity, Column } from 'typeorm';
import { User } from './User';

@ChildEntity()
export class Alumni extends User {
  @Column()
  firstName?: string;

  @Column()
  lastName?: string;

  @Column()
  sport?: string;

  @Column()
  position?: string;

  @Column()
  school?: string;

  @Column()
  major?: string;

  @Column({ type: 'float' })
  gpa?: number;

  @Column()
  division?: string;

  @Column({ type: 'text' })
  accolades?: string;

  @Column()
  teamRole?: string;

  @Column()
  coachability?: string;

  @Column()
  industry?: string;

  @Column({ type: 'boolean' })
  relocation?: boolean;

  @Column({ type: 'date' })
  graduationDate?: Date;

  // stats
  @Column({ type: 'int' })
  points?: number;

  @Column({ type: 'int' })
  assists?: number;

  // postGraduation
  @Column()
  jobTitle?: string;

  @Column()
  company?: string;

  @Column()
  jobLocation?: string;

  @Column({ type: 'text' })
  jobDescriptio?: string;
}
