import { ChildEntity, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Company } from './Company';

@ChildEntity()
export class CompanyEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @ManyToOne(() => Company, { nullable: true })
  companyRef?: Company;
}
