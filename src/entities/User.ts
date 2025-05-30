import { Entity, PrimaryGeneratedColumn, Column, TableInheritance, BaseEntity } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email?: string;

  @Column()
  password?: string;

  @Column({ default: 'user' })
  permission?: string;
}
