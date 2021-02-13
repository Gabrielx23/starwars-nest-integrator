import { forwardRef, Module } from '@nestjs/common';
import { controllers } from './Controllers';
import { UserRepository } from './Repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { services } from './Services';
import { CreateUserService } from './Services/create-user.service';
import { AuthService } from './Services/auth.service';
import { UserService } from './Services/user.service';
import { SWResourceModule } from '../SWResource/sw-resource.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), forwardRef(() => SWResourceModule)],
  controllers: [...controllers],
  providers: [...services],
  exports: [CreateUserService, AuthService, UserService],
})
export class UserModule {}
