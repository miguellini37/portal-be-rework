import { Entity, Column, TableInheritance, BaseEntity, PrimaryColumn } from 'typeorm';
import { USER_PERMISSIONS } from '../constants/user-permissions';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends BaseEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  permission?: USER_PERMISSIONS;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  isVerified?: boolean;
}
