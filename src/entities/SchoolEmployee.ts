import { Column, ChildEntity, ManyToOne } from 'typeorm';
import { User } from './User';
import { School } from './School';

@ChildEntity()
export class SchoolEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @ManyToOne(() => School, (school) => school.employees, { nullable: true })
  schoolRef?: School;

  @Column({ nullable: true })
  schoolName?: string;
}
