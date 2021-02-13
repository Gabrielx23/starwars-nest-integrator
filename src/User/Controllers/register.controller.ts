import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterDTO } from '../DTO/register.dto';
import { PasswordService } from '../Services/password.service';
import { CreateUserService } from '../Services/create-user.service';

@ApiTags('Auth')
@Controller('auth')
export class RegisterController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly passwordService: PasswordService,
  ) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  public async register(@Body() registerDTO: RegisterDTO): Promise<void> {
    const password = await this.passwordService.hash(registerDTO.password);

    const partial = { ...registerDTO, password };

    await this.createUserService.create(partial);
  }
}
