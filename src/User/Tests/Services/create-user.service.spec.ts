import { Test } from '@nestjs/testing';
import { CreateUserService } from '../../Services/create-user.service';
import { UserRepository } from '../../Repositories/user.repository';
import { UserEntity } from '../../user.entity';
import { BadRequestException } from '@nestjs/common';

const userRepositoryMock = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('CreateUserService', () => {
  let service: CreateUserService, repository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: UserRepository, useFactory: userRepositoryMock }],
    }).compile();

    repository = await module.get(UserRepository);
    service = new CreateUserService(repository);
  });

  describe('create', () => {
    const partial = { email: 'email', password: 'password' };

    const user = new UserEntity();
    user.password = 'password';
    user.email = 'email';

    it('throws bad request exception if email is already in use', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      await expect(service.create({ email: 'email' })).rejects.toThrow(BadRequestException);

      expect(repository.findOne).toHaveBeenCalledWith({ email: 'email' });
    });

    it('uses repository to create and save user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(user);

      await service.create(partial);

      expect(repository.create).toHaveBeenCalledWith(partial);
      expect(repository.save).toHaveBeenCalledWith(user);
    });

    it('returns created user without password', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(user);

      const result = await service.create(partial);

      const { password, ...partialWithoutPassword } = partial;

      expect(result).toEqual(partialWithoutPassword);
    });
  });
});
