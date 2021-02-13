import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database.config';
import { mainConfig } from './main.config';
import { UserModule } from './User/user.module';
import { SWResourceModule } from './SWResource/sw-resource.module';

@Module({
  imports: [
    UserModule,
    SWResourceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mainConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
