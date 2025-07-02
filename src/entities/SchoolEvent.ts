import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { School } from './School';

@Entity()
export class SchoolEvent extends BaseEntity {
@PrimaryGeneratedColumn('uuid')
  id!: number;

  @ManyToOne(() => School, { nullable: true })
  school?: School;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ nullable: true })
  location?: string;
}
