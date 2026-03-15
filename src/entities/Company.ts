import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  RelationId,
  JoinColumn,
} from 'typeorm';
import { Job } from './Job';
import { CompanyEmployee } from '.';

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

  @Index({ unique: true })
  @Column({ nullable: true })
  orgDomain?: string;

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAtDate!: Date;

  @OneToMany(() => CompanyEmployee, (user) => user.company)
  companyEmployees?: CompanyEmployee[];

  @ManyToOne(() => CompanyEmployee, { nullable: true })
  @JoinColumn({ name: 'ownerId' })
  companyOwner?: CompanyEmployee;

  @RelationId((company: Company) => company.companyOwner)
  ownerId?: string;
}
