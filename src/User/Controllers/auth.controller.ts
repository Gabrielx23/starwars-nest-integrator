import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../Repositories/user.repository';
import { LoginDTO } from '../DTO/login.dto';
import { AuthDTO } from '../DTO/auth.dto';
import { UserException } from '../Exceptions/user.exception';
import { PasswordService } from '../Services/password.service';
import { RefreshTokenDTO } from '../DTO/refresh-token.dto';
import { JwtTokenTypeEnum } from '../Enum/jwt-token-type.enum';
import { AuthException } from '../Exceptions/auth.exception';
import { AuthGuard } from '../auth.guard';
import { LoggedUser } from '../logged-user.decorator';
import { UserEntity } from '../user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(UserRepository)
    private readonly users: UserRepository,
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
  ) {}

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  public async logout(@LoggedUser() user: UserEntity): Promise<void> {
    await this.authService.logout(user);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ type: AuthDTO })
  @ApiBadRequestResponse()
  public async login(@Body() loginDTO: LoginDTO): Promise<AuthDTO> {
    const user = await this.users.findOne({ email: loginDTO.email });

    if (!user || !(await this.passwordService.verify(loginDTO.password, user.password))) {
      throw UserException.wrongCredentials();
    }

    return await this.authService.login(user);
  }

  @Post('refresh')
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ type: AuthDTO })
  @ApiBadRequestResponse()
  public async refresh(@Body() refreshTokenDTO: RefreshTokenDTO): Promise<AuthDTO> {
    const decoded = await this.authService.decodeToken(
      refreshTokenDTO.refreshToken,
      JwtTokenTypeEnum.refreshToken,
    );
    const user = await this.users.findOne({ email: decoded.email });

    if (!user) {
      throw AuthException.incorrectRefreshToken();
    }

    return await this.authService.login(user);
  }
}
