import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { User } from './User';
import { School } from './School';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: true })
  author?: User;

  @Column({ nullable: true })
  content?: string;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ nullable: true })
  type?: string;

  @ManyToOne(() => School, { nullable: true })
  school?: School;
}
