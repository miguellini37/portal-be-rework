import {
  Column,
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  RelationId,
} from 'typeorm';
import { SchoolEmployee } from './SchoolEmployee';
import { CompanyEmployee } from './CompanyEmployee';
import { Athlete } from './Athlete';

@Entity()
export class School extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, unique: true })
  schoolName?: string;

  @OneToOne(() => SchoolEmployee, { nullable: true })
  @JoinColumn() // necessary for @OneToOne owner side
  ownerRef?: SchoolEmployee;

  @RelationId((school: School) => school.ownerRef)
  ownerRefId?: string;

  @OneToMany(() => SchoolEmployee, (employee) => employee.schoolRef)
  employees?: SchoolEmployee[];

  @ManyToMany(() => CompanyEmployee, (employee) => employee.schoolRef)
  companyEmployees?: CompanyEmployee[];

  @ManyToMany(() => Athlete, (student) => student.schoolRef)
  athletes?: Athlete[];
}
