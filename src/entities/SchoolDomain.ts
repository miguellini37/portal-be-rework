import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { School } from './School';

@Entity()
export class SchoolDomain extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  domain!: string;

  @ManyToOne(() => School, (school) => school.schoolDomains, {
    onDelete: 'CASCADE',
  })
  school!: School;
}
