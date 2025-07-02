import { genSalt, hash } from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await genSalt(10);
      this.password = await hash(this.password, salt);
    }
  }

  @Column({ nullable: true })
  password?: string;

  @Column({ default: 'user', nullable: true })
  permission?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;
}
