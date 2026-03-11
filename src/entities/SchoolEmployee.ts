import { Column, ChildEntity, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { User } from './User';
import { School } from '.';

@ChildEntity()
export class SchoolEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  linkedIn?: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ nullable: true })
  officeLocation?: string;

  @Column({ nullable: true })
  officeHours?: string;

  @ManyToOne(() => School, (school) => school.employees, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school?: School;

  @RelationId((employee: SchoolEmployee) => employee.school)
  schoolId?: string;
}
