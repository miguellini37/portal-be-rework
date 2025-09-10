import { ChildEntity, Column, ManyToOne, RelationId } from 'typeorm';
import { User } from './User';
import { Company } from './Company';

@ChildEntity()
export class CompanyEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @ManyToOne(() => Company, (company) => company.companyEmployees)
  companyRef?: Company;

  @RelationId((employee: CompanyEmployee) => employee.companyRef)
  companyRefId?: string;
}
