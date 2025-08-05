import { Column, ChildEntity, ManyToOne } from 'typeorm';
import { User } from './User';
import { School } from './School';

class Academics {
  @Column({ nullable: true })
  major?: string;

  @Column({ nullable: true })
  minor?: string;

  @Column({ type: 'float', nullable: true })
  gpa?: number;

  @Column({ type: 'date', nullable: true })
  graduationDate?: Date;

  @Column({ nullable: true })
  awards?: string;

  @Column({ nullable: true })
  coursework?: string;
}

class Athletics {
  @Column({ nullable: true })
  sport?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  division?: string;

  @Column({ nullable: true })
  conference?: string;

  @Column({ nullable: true })
  yearsPlayed?: string;

  @Column({ nullable: true })
  leadershipRoles?: string;

  @Column({ nullable: true })
  achievements?: string;

  @Column({ nullable: true })
  statistics?: string;
}

@ChildEntity()
export class Athlete extends User {
  @Column(() => Academics)
  academics?: Academics;

  @Column(() => Athletics)
  athletics?: Athletics;

  @ManyToOne(() => School, { nullable: true })
  schoolRef?: School;
}
