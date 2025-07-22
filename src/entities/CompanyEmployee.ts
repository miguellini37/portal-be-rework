import { ChildEntity, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Company } from './Company';
import { School } from './School';

@ChildEntity()
export class CompanyEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  sport?: string;

  @ManyToOne(() => Company, (company) => company.employees, { nullable: true })
  companyRef?: Company;

  @Column({ nullable: true })
  companyName?: string;

  @ManyToOne(() => School, (school) => school.employees, { nullable: true })
  schoolRef?: School;
}
