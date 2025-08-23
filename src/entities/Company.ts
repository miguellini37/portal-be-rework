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

export interface SpecificRecruitingStrategy {
  icon?: string;
  title: string;
  description?: string;
}

export interface Recruiting {
  strategy: SpecificRecruitingStrategy[];
  processSteps: string[];
  recruiterIds: string[]; // CompanyEmployee IDs
}

export class Culture {
  @Column({ type: 'json', nullable: true })
  cultureValues?: string[] | null;

  @Column({ type: 'json', nullable: true })
  environmentTiles?: string[] | null;

  @Column({ type: 'json', nullable: true })
  thrivePoints?: string[] | null;
}
export class SpecificBenefits {
  @Column({ type: 'string', nullable: true })
  title?: string;

  @Column({ type: 'json', nullable: true })
  description?: string[];

  @Column({ type: 'string', nullable: true })
  icon?: string;
}
export class Benefits {
  @Column({ type: 'integer', nullable: true })
  baseSalaryMin?: number;

  @Column({ type: 'integer', nullable: true })
  baseSalaryMax?: number;

  // Commission
  @Column({ type: 'integer', nullable: true })
  commissionMin?: number;

  @Column({ type: 'integer', nullable: true })
  commissionMax?: number;

  // Total comp
  @Column({ type: 'integer', nullable: true })
  totalCompMin?: number;

  @Column({ type: 'integer', nullable: true })
  totalCompMax?: number;
 
  @Column({ type: 'json', nullable: true })
  specificBenefits?: SpecificBenefits[] | null;
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
  companyEmployees?: CompanyEmployee[];

  @Column({ nullable: true })
  industry?: string;

  @OneToMany(() => Job, (job) => job.company)
  jobs?: Job[];

  @Column(() => Culture)
  culture?: Culture;

  @Column(() => Benefits)
  benefits?: Benefits;

  @Column({ type: 'json', nullable: true })
  recruiting?: Recruiting | null;
}
