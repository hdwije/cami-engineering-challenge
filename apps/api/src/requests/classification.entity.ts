import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerRequest } from './customer-request.entity';

@Entity({ name: 'classifications' })
export class Classification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  category!: string | null;

  @Column({ type: 'float', nullable: true })
  confidence!: number | null;

  @Column({ type: 'varchar', nullable: true })
  provider!: string;

  @ManyToOne(() => CustomerRequest, (request) => request.classifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request!: CustomerRequest;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
