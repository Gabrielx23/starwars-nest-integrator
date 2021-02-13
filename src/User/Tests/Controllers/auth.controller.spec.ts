import { Test } from '@nestjs/testing';
import { PasswordService } from '../../Services/password.service';
import { AuthService } from '../../Services/auth.service';
import { UserRepository } from '../../Repositories/user.repository';
import { AuthController } from '../../Controllers/auth.controller';
import { LoginDTO } from '../../DTO/login.dto';
import { UserEntity } from '../../user.entity';
import { BadRequestException } from '@nestjs/common';
import { AuthDTO } from '../../DTO/auth.dto';
import { RefreshTokenDTO } from '../../DTO/refresh-token.dto';
import { AuthTokenPayloadDTO } from '../../DTO/auth-token-payload.dto';
import { JwtTokenTypeEnum } from '../../Enum/jwt-token-type.enum';

const repositoryMock = () => ({
  findOne: jest.fn(),
});

const passwordServiceMock = () => ({
  verify: jest.fn(),
});

const authServiceMock = () => ({
  decodeToken: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
});

const user = new UserEntity();
user.password = 'password';
user.email = 'email';

describe('AuthController', () => {
  let authService: AuthService,
    passwordService: PasswordService,
    repository: UserRepository,
    controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useFactory: authServiceMock },
        { provide: PasswordService, useFactory: passwordServiceMock },
        { provide: UserRepository, useFactory: repositoryMock },
      ],
    }).compile();

    authService = await module.resolve(AuthService);
    passwordService = await module.resolve(PasswordService);
    repository = await module.get(UserRepository);
    controller = new AuthController(repository, authService, passwordService);
  });

  describe('login', () => {
    const dto = new LoginDTO();
    dto.email = 'test@test.pl';
    dto.password = 'password';

    it('uses user repository to obtain user by email and throw exception if user not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(controller.login(dto)).rejects.toThrow(BadRequestException);

      expect(repository.findOne).toHaveBeenCalledWith({ email: dto.email });
    });

    it('throws exception if user password does not match', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(passwordService, 'verify').mockResolvedValue(false);

      await expect(controller.login(dto)).rejects.toThrow(BadRequestException);

      expect(passwordService.verify).toHaveBeenCalledWith(dto.password, user.password);
    });

    it('uses auth service to log in user and returns it result', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(passwordService, 'verify').mockResolvedValue(true);
      jest.spyOn(authService, 'login').mockResolvedValue(new AuthDTO());

      const result = await controller.login(dto);

      expect(result).toEqual(new AuthDTO());
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('refresh', () => {
    const dto = new RefreshTokenDTO();
    dto.refreshToken = 'refreshToken';

    const payloadDTO = new AuthTokenPayloadDTO();
    payloadDTO.email = 'email@test.pl';

    it('uses auth service to decode token', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);

      await controller.refresh(dto);

      expect(authService.decodeToken).toHaveBeenCalledWith(
        dto.refreshToken,
        JwtTokenTypeEnum.refreshToken,
      );
    });

    it('uses repository to obtain user by decoded email', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);

      await controller.refresh(dto);

      expect(repository.findOne).toHaveBeenCalledWith({ email: payloadDTO.email });
    });

    it('throws exception if user not exist by decoded email', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);

      await expect(controller.refresh(dto)).rejects.toThrow(BadRequestException);
    });

    it('uses auth service to re log in user and returns it result', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);
      jest.spyOn(authService, 'login').mockResolvedValue(new AuthDTO());

      const result = await controller.refresh(dto);

      expect(result).toEqual(new AuthDTO());
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('logout', () => {
    it('uses auth service to log out user', async () => {
      await controller.logout(user);

      expect(authService.logout).toHaveBeenCalledWith(user);
    });
  });
});
