import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database.config';
import { mainConfig } from './main.config';

@Module({
  imports: [
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
