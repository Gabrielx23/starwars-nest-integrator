import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDTO {
  @ApiProperty({ example: '1eabab32-5487-64d2-bb6f-0a002700000c' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
