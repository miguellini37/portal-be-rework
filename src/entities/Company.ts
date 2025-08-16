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

export class Culture {
  @Column({ type: 'json', nullable: true })
  cultureValues?: string[] | null;

  @Column({ type: 'json', nullable: true })
  environmentTiles?: string[] | null;

  @Column({ type: 'json', nullable: true })
  thrivePoints?: string[] | null;
}
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

  @Column(() => Culture)
  culture?: Culture;
}
