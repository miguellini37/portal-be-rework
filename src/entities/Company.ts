import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { CompanyEmployee } from './CompanyEmployee';
import { Job } from './Job';

@Entity()
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, unique: true })
  companyName?: string;

  @OneToOne(() => CompanyEmployee, { nullable: true })
  @JoinColumn()
  ownerRef?: CompanyEmployee;

  @RelationId((company: Company) => company.ownerRef)
  ownerRefId?: string;

  @OneToMany(() => CompanyEmployee, (employee) => employee.companyRef)
  employees?: CompanyEmployee[];

  @Column({ nullable: true })
  industry?: string;

  @OneToMany(() => Job, (job) => job.company)
  jobs?: Job[];

  @Column({ type: 'json', nullable: true })
  culture?: {
    valueKeys: string[];
    environmentKeys: string[];
    thrivePoints: string[];
  } | null;
}
