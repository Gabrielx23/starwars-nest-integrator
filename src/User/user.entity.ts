import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('users')
@Unique(['email'])
export class UserEntity extends BaseEntity {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'john.doe@hotmail.com' })
  @Column('text')
  email: string;

  @ApiProperty({ example: 'testtest' })
  @Column('text')
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  token: string;

  @ApiProperty({ example: 'https://swapi.dev/api/people/1/' })
  @Column('text')
  swHero: string;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
