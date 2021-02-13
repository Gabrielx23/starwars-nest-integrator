import { Injectable } from '@nestjs/common';
import { UserRepository } from '../Repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user.entity';
import { UserException } from '../Exceptions/user.exception';

@Injectable()
export class CreateUserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly users: UserRepository,
  ) {}

  public async create(partial: Partial<UserEntity>): Promise<Partial<UserEntity>> {
    if (await this.users.findOne({ email: partial.email })) {
      throw UserException.credentialsAlreadyInUse();
    }

    const user = this.users.create(partial);

    await this.users.save(user);

    const { password, ...created } = user;

    return created;
  }
}
