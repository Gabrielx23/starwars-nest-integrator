import { Injectable } from '@nestjs/common';
import { ResourceClient } from '../Clients/resource.client';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../env-key.enum';

@Injectable()
export class HeroService {
  constructor(
    private readonly resourceClient: ResourceClient,
    private readonly configService: ConfigService,
  ) {}

  public async getRandomHeroUrl(): Promise<string> {
    const peopleUrl = this.configService.get(EnvKeyEnum.SWPeopleEndpoint);
    const people = await this.resourceClient.getResource(peopleUrl);
    const countOfPeople = people.count;
    const heroId = Math.floor(Math.random() * (countOfPeople - 1)) + 1;
    return `${peopleUrl}${heroId}`;
  }
}
