import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyEmployee } from './CompanyEmployee';

@Entity()
export class Company extends BaseEntity {
@PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({ nullable: true, unique: true })
  companyName?: string;

  @OneToOne(() => CompanyEmployee, { nullable: true })
  @JoinColumn()
  ownerRef?: CompanyEmployee;

  @OneToMany(() => CompanyEmployee, (employee) => employee.companyRef)
  employees?: CompanyEmployee[];

  @Column({ nullable: true })
  industry?: string;
}
