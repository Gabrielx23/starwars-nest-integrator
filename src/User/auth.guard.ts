import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { AuthService } from './Services/auth.service';
import { JwtTokenTypeEnum } from './Enum/jwt-token-type.enum';
import { AuthException } from './Exceptions/auth.exception';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw AuthException.incorrectAuthorizationToken();
    }

    const payload = await this.authService.decodeToken(token, JwtTokenTypeEnum.token);
    const user = await this.authService.getUserFromTokenPayload(payload);

    if (!user || user.token !== token.replace('Bearer ', '')) {
      throw AuthException.incorrectAuthorizationToken();
    }

    request.user = user;

    return true;
  }
}
