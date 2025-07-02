import { Column, ChildEntity, JoinTable, ManyToMany } from 'typeorm';
import { User } from './User';
import { School } from './School';

@ChildEntity()
export class Athlete extends User {
  @Column({ nullable: true })
  sport?: string;

  @Column({ nullable: true })
  position?: string;

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

  @Column({ type: 'date', nullable: true })
  graduationDate?: Date;

  @Column({ nullable: true })
  statistics?: string;

  @Column({ type: 'simple-array', nullable: true })
  internshipIds?: number[];

  @ManyToMany(() => School, { nullable: true })
  @JoinTable()
  schools?: School[];
}
