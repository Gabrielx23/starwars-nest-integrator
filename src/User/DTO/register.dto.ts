import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'john.doe@hotmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'testtest' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
