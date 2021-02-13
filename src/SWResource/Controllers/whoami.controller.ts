import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResourceService } from '../Services/resource.service';
import { AuthGuard } from '../../User/auth.guard';
import { LoggedUser } from '../../User/logged-user.decorator';
import { UserEntity } from '../../User/user.entity';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Star Wars Resources')
@Controller('whoami')
export class WhoAmIController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  public async get(@LoggedUser() user: UserEntity): Promise<any> {
    let userHero = await this.resourceService.get(user.swHero);
    userHero = this.resourceService.convertProtectedUrls(userHero);
    const { url, ...userHeroWithoutUrl } = userHero;

    return userHeroWithoutUrl;
  }
}
