import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: true })
  fromUser?: User;

  @ManyToOne(() => User, { nullable: true })
  toUser?: User;

  @Column({ nullable: true })
  message?: string;

  @Column({ type: 'timestamp', nullable: true })
  createdDate?: Date;
}
