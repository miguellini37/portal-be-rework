import { ChildEntity, Column } from 'typeorm';
import { User } from './User';

@ChildEntity()
export class Company extends User {
  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  industry?: string;
}
