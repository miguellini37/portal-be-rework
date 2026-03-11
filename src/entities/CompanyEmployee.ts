import { ChildEntity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { User } from './User';
import { Company } from './Company';

@ChildEntity()
export class CompanyEmployee extends User {
  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  linkedIn?: string;

  @Column({ nullable: true })
  roleType?: string;

  @Column({ nullable: true })
  isFormerAthlete?: boolean;

  @Column({ nullable: true })
  athleteSport?: string;

  @Column({ nullable: true })
  athletePosition?: string;

  @Column({ nullable: true })
  athleteUniversity?: string;

  @Column({ nullable: true })
  athleteGraduationYear?: string;

  @Column({ type: 'text', nullable: true })
  athleteAchievements?: string;

  @ManyToOne(() => Company, (company) => company.companyEmployees, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @RelationId((employee: CompanyEmployee) => employee.company)
  companyId?: string;
}
