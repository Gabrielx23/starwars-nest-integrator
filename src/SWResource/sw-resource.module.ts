import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { controllers } from './Controllers';
import { services } from './Services';
import { clients } from './Clients';
import { HeroService } from './Services/hero.service';

@Module({
  imports: [CacheModule.register(), HttpModule],
  controllers: [...controllers],
  providers: [...services, ...clients],
  exports: [HeroService],
})
export class SWResourceModule {}
