import { ChildEntity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { User } from './User';
import { Company } from './Company';

@ChildEntity()
export class CompanyEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @ManyToOne(() => Company, (company) => company.companyEmployees, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @RelationId((employee: CompanyEmployee) => employee.company)
  companyId?: string;
}
