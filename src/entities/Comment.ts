import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @ManyToOne(() => Post, { nullable: true })
  post?: Post;

  @ManyToOne(() => User, { nullable: true })
  author?: User;

  @Column({ nullable: true })
  content?: string;
}
