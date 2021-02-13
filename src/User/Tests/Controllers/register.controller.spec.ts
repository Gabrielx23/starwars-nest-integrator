import { Test } from '@nestjs/testing';
import { RegisterController } from '../../Controllers/register.controller';
import { PasswordService } from '../../Services/password.service';
import { RegisterDTO } from '../../DTO/register.dto';
import { CreateUserService } from '../../Services/create-user.service';

const createUserServiceMock = () => ({
  create: jest.fn(),
});

const passwordServiceMock = () => ({
  hash: jest.fn(),
});

describe('RegisterController', () => {
  let createUserService: CreateUserService,
    passwordService: PasswordService,
    controller: RegisterController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: CreateUserService, useFactory: createUserServiceMock },
        { provide: PasswordService, useFactory: passwordServiceMock },
      ],
    }).compile();

    createUserService = await module.resolve(CreateUserService);
    passwordService = await module.resolve(PasswordService);
    controller = new RegisterController(createUserService, passwordService);
  });

  describe('register', () => {
    const dto = new RegisterDTO();
    dto.email = 'test@test.pl';
    dto.password = 'password';

    it('uses password service to hash user password', async () => {
      await controller.register(dto);

      expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
    });

    it('uses create user service to create user with given data', async () => {
      jest.spyOn(passwordService, 'hash').mockResolvedValue('hashed');

      const partial = { ...dto, password: 'hashed' };

      await controller.register(dto);

      expect(createUserService.create).toHaveBeenCalledWith(partial);
    });
  });
});
