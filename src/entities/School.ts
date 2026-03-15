import {
  Column,
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  RelationId,
  JoinColumn,
} from 'typeorm';
import { Athlete, SchoolDomain, SchoolEmployee } from '.';

@Entity()
export class School extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, unique: true })
  schoolName?: string;

  @OneToMany(() => SchoolDomain, (domain) => domain.school, { cascade: true })
  schoolDomains?: SchoolDomain[];

  @OneToMany(() => Athlete, (athlete) => athlete.school)
  athletes?: Athlete[];

  @OneToMany(() => SchoolEmployee, (employee) => employee.school)
  employees?: SchoolEmployee[];

  @ManyToOne(() => SchoolEmployee, { nullable: true })
  @JoinColumn({ name: 'ownerId' })
  schoolOwner?: SchoolEmployee;

  @RelationId((school: School) => school.schoolOwner)
  ownerId?: string;
}
