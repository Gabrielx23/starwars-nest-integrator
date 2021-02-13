import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { HeroService } from '../../Services/hero.service';
import { ResourceClient } from '../../Clients/resource.client';
import { EnvKeyEnum } from '../../../env-key.enum';

const resourceClientMock = () => ({
  getResource: jest.fn(),
});

const configServiceMock = () => ({
  get: jest.fn(),
});

describe('HeroService', () => {
  let service: HeroService, resourceClient: ResourceClient, config: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: ResourceClient, useFactory: resourceClientMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    resourceClient = await module.resolve(ResourceClient);
    config = await module.resolve(ConfigService);
    service = new HeroService(resourceClient, config);
  });

  describe('checkHeroPrivileges', () => {
    const hero = {
      planets: ['http://planet1.uri'],
    };

    it('throws exception if hero has not enough privileges', async () => {
      await expect(service.checkHeroPrivileges(hero, 'http://planet2.uri')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getRandomHeroUrl', () => {
    const swUrl = 'http://sw.com/';
    const people = { count: 1 };

    it('uses config service to obtain sw api url and resource client to obtain people', async () => {
      jest.spyOn(resourceClient, 'getResource').mockResolvedValue(people);
      jest.spyOn(config, 'get').mockReturnValue(swUrl);

      await service.getRandomHeroUrl();

      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.SWEndpoint);
      expect(resourceClient.getResource).toHaveBeenCalledWith(`${swUrl}people/`);
    });

    it('returns random hero url', async () => {
      jest.spyOn(resourceClient, 'getResource').mockResolvedValue(people);
      jest.spyOn(config, 'get').mockReturnValue(swUrl);

      const result = await service.getRandomHeroUrl();

      expect(result).toEqual(`${swUrl}people/1`);
    });
  });
});
