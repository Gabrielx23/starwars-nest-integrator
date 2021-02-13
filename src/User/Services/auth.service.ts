import { Injectable } from '@nestjs/common';
import { UserRepository } from '../Repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user.entity';
import { AuthDTO } from '../DTO/auth.dto';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../env-key.enum';
import * as jwt from 'jsonwebtoken';
import { JwtTokenTypeEnum } from '../Enum/jwt-token-type.enum';
import { AuthException } from '../Exceptions/auth.exception';
import { AuthTokenPayloadDTO } from '../DTO/auth-token-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly users: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  public async getUserFromTokenPayload(payload: AuthTokenPayloadDTO): Promise<UserEntity> {
    return await this.users.findOne({ email: payload.email });
  }

  public async decodeToken(
    token: string,
    tokenType: JwtTokenTypeEnum,
  ): Promise<AuthTokenPayloadDTO | any> {
    let secret = this.configService.get(EnvKeyEnum.JWTSecretKey);

    if (tokenType === JwtTokenTypeEnum.refreshToken) {
      secret = this.configService.get(EnvKeyEnum.JWTRefreshSecretKey);
    }

    token = token.replace('Bearer ', '');

    try {
      return jwt.verify(token, secret);
    } catch (err) {
      throw AuthException.incorrectAuthorizationToken();
    }
  }

  public async logout(user: UserEntity): Promise<void> {
    user.token = null;
    await this.users.save(user);
  }

  public async login(user: UserEntity): Promise<AuthDTO> {
    const secret = this.configService.get(EnvKeyEnum.JWTSecretKey);
    const refreshSecret = this.configService.get(EnvKeyEnum.JWTRefreshSecretKey);
    const expiresIn = this.configService.get(EnvKeyEnum.JWTExpiresIn);
    const expiresInUnit = this.configService.get(EnvKeyEnum.JWTExpiresInUnit);
    const refreshTokenExpiresIn = expiresIn * 2;

    const authDTO = new AuthDTO();
    authDTO.token = jwt.sign({ email: user.email }, secret, {
      expiresIn: expiresIn + expiresInUnit,
    });
    authDTO.refreshToken = jwt.sign({ email: user.email }, refreshSecret, {
      expiresIn: refreshTokenExpiresIn + expiresInUnit,
    });

    user.token = authDTO.token;
    await this.users.save(user);

    return authDTO;
  }
}
