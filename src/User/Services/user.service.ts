import { Injectable } from '@nestjs/common';
import { UserRepository } from '../Repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly users: UserRepository,
  ) {}

  public async getAll(): Promise<Array<UserEntity>> {
    return await this.users.find();
  }

  public async getById(id: string): Promise<UserEntity | null> {
    return await this.users.findOne({ id });
  }
}
