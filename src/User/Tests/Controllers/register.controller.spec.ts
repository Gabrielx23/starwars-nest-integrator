import { Test } from '@nestjs/testing';
import { RegisterController } from '../../Controllers/register.controller';
import { PasswordService } from '../../Services/password.service';
import { RegisterDTO } from '../../DTO/register.dto';
import { CreateUserService } from '../../Services/create-user.service';
import { HeroService } from '../../../SWResource/Services/hero.service';

const createUserServiceMock = () => ({
  create: jest.fn(),
});

const passwordServiceMock = () => ({
  hash: jest.fn(),
});

const heroServiceMock = () => ({
  getRandomHeroUrl: jest.fn(),
});

describe('RegisterController', () => {
  let createUserService: CreateUserService,
    passwordService: PasswordService,
    heroService: HeroService,
    controller: RegisterController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: CreateUserService, useFactory: createUserServiceMock },
        { provide: PasswordService, useFactory: passwordServiceMock },
        { provide: HeroService, useFactory: heroServiceMock },
      ],
    }).compile();

    createUserService = await module.resolve(CreateUserService);
    heroService = await module.resolve(HeroService);
    passwordService = await module.resolve(PasswordService);
    controller = new RegisterController(createUserService, passwordService, heroService);
  });

  describe('register', () => {
    const dto = new RegisterDTO();
    dto.email = 'test@test.pl';
    dto.password = 'password';

    it('uses password service to hash user password', async () => {
      await controller.register(dto);

      expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
    });

    it('uses hero service to obtain sw hero for new user', async () => {
      jest.spyOn(heroService, 'getRandomHeroUrl').mockResolvedValue('http://url');

      await controller.register(dto);

      expect(heroService.getRandomHeroUrl).toHaveBeenCalled();
    });

    it('uses create user service to create user with given data', async () => {
      jest.spyOn(passwordService, 'hash').mockResolvedValue('hashed');
      jest.spyOn(heroService, 'getRandomHeroUrl').mockResolvedValue('http://url');

      const partial = { ...dto, password: 'hashed', swHero: 'http://url' };

      await controller.register(dto);

      expect(createUserService.create).toHaveBeenCalledWith(partial);
    });
  });
});
