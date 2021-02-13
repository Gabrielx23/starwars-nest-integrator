import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDTO {
  @ApiProperty({ example: '1eabab32-5487-64d2-bb6f-0a002700000c' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: '1eabab32-5487-64d2-bb6f-0a002700000c' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
