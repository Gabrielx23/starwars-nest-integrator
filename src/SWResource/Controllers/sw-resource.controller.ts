import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResourceService } from '../Services/resource.service';
import { ResourceTypeEnum } from '../Enum/resource-type.enum';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../env-key.enum';
import { AuthGuard } from '../../User/auth.guard';
import { LoggedUser } from '../../User/logged-user.decorator';
import { UserEntity } from '../../User/user.entity';
import { HeroService } from '../Services/hero.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Star Wars Resources')
@Controller('sw')
export class SWResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly configService: ConfigService,
    private readonly heroService: HeroService,
  ) {}

  @Get('/:type/:id?')
  @UsePipes(ValidationPipe)
  @ApiParam({ name: 'type', enum: ResourceTypeEnum, required: true })
  @ApiParam({ name: 'id', required: false, allowEmptyValue: true })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  public async get(
    @LoggedUser() user: UserEntity,
    @Param('type') type: ResourceTypeEnum,
    @Param('id') id = '',
  ): Promise<any> {
    const swUrl = this.configService.get(EnvKeyEnum.SWEndpoint);
    const url = `${swUrl}${type}/${id}`;
    const userHero = await this.resourceService.get(user.swHero);

    if (!id && !userHero[type]) {
      return null;
    }

    if (!id && userHero[type]) {
      return await this.resourceService.getAll(userHero[type]);
    }

    await this.heroService.checkHeroPrivileges(userHero, url);

    const resource = await this.resourceService.get(url);

    return this.resourceService.convertProtectedUrls(resource);
  }
}
