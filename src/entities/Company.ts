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
export class SpecficBenefits {
  @Column({ type: 'string', nullable: true })
  title?: string;

  @Column({ type: 'json', nullable: true })
  description?: string[];

  @Column({ type: 'string', nullable: true })
  icon?: string;
}
export class Benefits {
  @Column({ type: 'json', nullable: true }) 
  baseSalary?: number[]; //if len = 1 than avg salary if len = 2 range

  @Column({ type: 'json', nullable: true })
  commission?: number[]; //if len = 1 than avg salary if len = 2 range

  @Column({ type: 'json', nullable: true })
  totalComp?: number[]; //if len = 1 than avg salary if len = 2 range
 
  @Column({ type: 'json', nullable: true })
  specficBenefits?: SpecficBenefits[] | null;
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

  @Column(() => Benefits)
  benefits?: Benefits;
}
