import { Column, ChildEntity, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { User } from './User';
import { School } from '.';

@ChildEntity()
export class SchoolEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @ManyToOne(() => School, (school) => school.employees, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school?: School;

  @RelationId((employee: SchoolEmployee) => employee.school)
  schoolId?: string;
}
