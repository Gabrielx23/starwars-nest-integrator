import { Injectable } from '@nestjs/common';
import { ResourceClient } from '../Clients/resource.client';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../env-key.enum';
import { SWResourceException } from '../sw-resource.exception';

@Injectable()
export class HeroService {
  private static PEOPLE_ENDPOINT = 'people';

  constructor(
    private readonly resourceClient: ResourceClient,
    private readonly configService: ConfigService,
  ) {}

  public async checkHeroPrivileges(hero: object, resourceUrl: string): Promise<void> {
    const heroAsJson = JSON.stringify(hero);

    if (!heroAsJson.includes(resourceUrl)) {
      throw SWResourceException.resourceIsRestricted();
    }
  }

  public async getRandomHeroUrl(): Promise<string> {
    const swUrl = this.configService.get(EnvKeyEnum.SWEndpoint);
    const peopleUrl = `${swUrl}${HeroService.PEOPLE_ENDPOINT}/`;
    const people = await this.resourceClient.getResource(peopleUrl);
    const countOfPeople = people.count;
    const heroId = Math.floor(Math.random() * (countOfPeople - 1)) + 1;

    return `${peopleUrl}${heroId}`;
  }
}
