import { Test } from '@nestjs/testing';
import { UserService } from '../../Services/user.service';
import { UserRepository } from '../../Repositories/user.repository';
import { UserEntity } from '../../user.entity';

const repositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
});

const user = new UserEntity();

describe('UserService', () => {
  let service: UserService, repository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: UserRepository, useFactory: repositoryMock }],
    }).compile();

    repository = await module.get(UserRepository);
    service = new UserService(repository);
  });

  describe('getById', () => {
    it('uses product repository to obtain product by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.getById('id');

      expect(repository.findOne).toBeCalledWith({ id: 'id' });
      expect(result).toEqual(user);
    });
  });

  describe('getAll', () => {
    it('uses product repository to obtain all users', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([user]);

      const result = await service.getAll();

      expect(repository.find).toBeCalled();
      expect(result).toEqual([user]);
    });
  });
});
