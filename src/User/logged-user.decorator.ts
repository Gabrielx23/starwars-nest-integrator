import { createParamDecorator } from '@nestjs/common';
import { UserEntity } from './user.entity';

export const LoggedUser = createParamDecorator(
  (data, req): UserEntity => {
    const request = req.switchToHttp().getRequest();

    return request.user;
  },
);
