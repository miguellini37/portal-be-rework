import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { Company } from './Company';

@Entity()
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Company, { nullable: true })
  company?: Company;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  salary?: string;

  @Column({ nullable: true })
  benefit?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  requirements?: string;

  @Column({ nullable: true })
  type?: string; // internship or job
}
