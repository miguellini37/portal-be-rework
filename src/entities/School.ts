import {
  Column,
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { SchoolEmployee } from './SchoolEmployee';
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

  @ManyToMany(() => SchoolEmployee, (employee) => employee.schoolRef)
  employees?: SchoolEmployee[];

  @ManyToMany(() => Athlete, (student) => student.schoolRef)
  athletes?: Athlete[];
}
