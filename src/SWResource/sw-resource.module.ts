import { CacheModule, forwardRef, HttpModule, Module } from '@nestjs/common';
import { controllers } from './Controllers';
import { services } from './Services';
import { clients } from './Clients';
import { HeroService } from './Services/hero.service';
import { UserModule } from '../User/user.module';

@Module({
  imports: [CacheModule.register(), HttpModule, forwardRef(() => UserModule)],
  controllers: [...controllers],
  providers: [...services, ...clients],
  exports: [HeroService],
})
export class SWResourceModule {}
