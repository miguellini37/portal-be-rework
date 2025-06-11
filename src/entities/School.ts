import { Column, ChildEntity } from 'typeorm';
import { User } from './User';

@ChildEntity()
export class School extends User {
  @Column({ nullable: true })
  schoolName?: string;
}
