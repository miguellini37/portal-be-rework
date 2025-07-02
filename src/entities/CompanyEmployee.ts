import { ChildEntity, Column, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
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

  @ManyToMany(() => School, { nullable: true })
  @JoinTable()
  schools?: School[];
}
