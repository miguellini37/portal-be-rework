import { ChildEntity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { User } from './User';
import { Company } from './Company';

@ChildEntity()
export class CompanyEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  // Owning side (FK lives here)
  @ManyToOne(() => Company, (company) => company.companyEmployees, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn() // optional: set FK column name
  companyRef?: Company;

  @RelationId((employee: CompanyEmployee) => employee.companyRef)
  companyRefId?: string;
}
