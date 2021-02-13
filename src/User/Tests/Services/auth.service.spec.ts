import { Test } from '@nestjs/testing';
import { UserRepository } from '../../Repositories/user.repository';
import { UserEntity } from '../../user.entity';
import { AuthService } from '../../Services/auth.service';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../../env-key.enum';
import { AuthDTO } from '../../DTO/auth.dto';
import * as jwt from 'jsonwebtoken';
import { JwtTokenTypeEnum } from '../../Enum/jwt-token-type.enum';
import { UnauthorizedException } from '@nestjs/common';
import { AuthTokenPayloadDTO } from '../../DTO/auth-token-payload.dto';

const userRepositoryMock = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
});

const configServiceMock = () => ({
  get: jest.fn(),
});

const user = new UserEntity();
user.password = 'password';
user.email = 'email';

describe('AuthService', () => {
  let service: AuthService, repository: UserRepository, config: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useFactory: userRepositoryMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    repository = await module.get(UserRepository);
    config = await module.get(ConfigService);
    service = new AuthService(repository, config);
  });

  describe('getUserFromTokenPayload', () => {
    const payload = new AuthTokenPayloadDTO();
    payload.email = 'email@test.pl';

    it('uses repository to obtain user from token payload', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.getUserFromTokenPayload(payload);

      expect(repository.findOne).toHaveBeenCalledWith({ email: payload.email });
      expect(result).toEqual(user);
    });
  });

  describe('logout', () => {
    it('sets user token as null', async () => {
      user.token = 'token';

      await service.logout(user);

      user.token = null;

      expect(repository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('login', () => {
    it('uses config service to obtain all required env data', async () => {
      jest.spyOn(config, 'get').mockReturnValue('60');

      await service.login(user);

      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTSecretKey);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTRefreshSecretKey);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTExpiresIn);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTExpiresInUnit);
    });

    it('saves user with new token and returns auth dto', async () => {
      jest.spyOn(config, 'get').mockReturnValue('60');

      const result = await service.login(user);

      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(AuthDTO);
    });
  });

  describe('decodeToken', () => {
    const token = jwt.sign({ email: user.email }, 'secret', { expiresIn: 60 });

    it('obtains refresh token secret if token type is refresh token', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      await service.decodeToken(token, JwtTokenTypeEnum.refreshToken);

      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTSecretKey);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTRefreshSecretKey);
    });

    it('obtains only token secret if token type is not refresh token', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      await service.decodeToken(token, JwtTokenTypeEnum.token);

      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTSecretKey);
    });

    it('returns decoded payload if token is correct', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      const result = await service.decodeToken(token, JwtTokenTypeEnum.token);

      expect(result.email).toEqual(user.email);
    });

    it('throws unauthorized exception if token is incorrect', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      await expect(service.decodeToken('bad', JwtTokenTypeEnum.token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
