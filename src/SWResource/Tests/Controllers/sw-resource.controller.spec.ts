import { Test } from '@nestjs/testing';
import { ResourceService } from '../../Services/resource.service';
import { UserEntity } from '../../../User/user.entity';
import { SWResourceController } from '../../Controllers/sw-resource.controller';
import { ConfigService } from '@nestjs/config';
import { HeroService } from '../../Services/hero.service';
import { EnvKeyEnum } from '../../../env-key.enum';
import { ResourceTypeEnum } from '../../Enum/resource-type.enum';

const resourceServiceMock = () => ({
  get: jest.fn(),
  convertProtectedUrls: jest.fn(),
  getAll: jest.fn(),
});

const configServiceMock = () => ({
  get: jest.fn(),
});

const heroServiceMock = () => ({
  checkHeroPrivileges: jest.fn(),
});

const user = new UserEntity();
user.password = 'password';
user.swHero = 'http://hero.url';

describe('SWResourceController', () => {
  let resourceService: ResourceService,
    configService: ConfigService,
    heroService: HeroService,
    controller: SWResourceController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: ResourceService, useFactory: resourceServiceMock },
        { provide: ConfigService, useFactory: configServiceMock },
        { provide: HeroService, useFactory: heroServiceMock },
      ],
    }).compile();

    resourceService = await module.resolve(ResourceService);
    heroService = await module.resolve(HeroService);
    configService = await module.resolve(ConfigService);
    controller = new SWResourceController(resourceService, configService, heroService);
  });

  describe('get', () => {
    const swUrl = 'http://sw.com/';
    const hero = { url: 'some.url', planets: [`${swUrl}planets/1`, `${swUrl}planets/5`] };
    const planet = { url: 'some.planet' };

    it('uses config service to obtain sw api url and resource service to obtain user hero', async () => {
      jest.spyOn(resourceService, 'get').mockResolvedValue(hero);
      jest.spyOn(configService, 'get').mockReturnValue(swUrl);

      await controller.get(user, ResourceTypeEnum.films);

      expect(configService.get).toHaveBeenCalledWith(EnvKeyEnum.SWEndpoint);
      expect(resourceService.get).toHaveBeenCalledWith(user.swHero);
    });

    it('returns null if id is undefined and user hero not contain selected resource type', async () => {
      jest.spyOn(resourceService, 'get').mockResolvedValue(hero);
      jest.spyOn(configService, 'get').mockReturnValue(swUrl);

      const result = await controller.get(user, ResourceTypeEnum.films);

      expect(result).toBeNull();
    });

    it('returns getAll resource service response if id is set and user hero contain selected resource type', async () => {
      jest.spyOn(resourceService, 'getAll').mockResolvedValue([planet, planet]);
      jest.spyOn(resourceService, 'get').mockResolvedValue(hero);
      jest.spyOn(configService, 'get').mockReturnValue(swUrl);

      const result = await controller.get(user, ResourceTypeEnum.planets);

      expect(result).toEqual([planet, planet]);
    });

    it('uses hero service to check hero privileges if id is set', async () => {
      jest.spyOn(resourceService, 'get').mockResolvedValue(hero);
      jest.spyOn(configService, 'get').mockReturnValue(swUrl);

      await controller.get(user, ResourceTypeEnum.planets, '1');

      expect(heroService.checkHeroPrivileges).toHaveBeenCalledWith(hero, `${swUrl}planets/1`);
    });

    it('uses resource service to obtain and convert resource by id and returns converted resource', async () => {
      jest.spyOn(resourceService, 'get').mockResolvedValueOnce(hero).mockResolvedValueOnce(planet);
      jest.spyOn(resourceService, 'convertProtectedUrls').mockReturnValue(planet);
      jest.spyOn(configService, 'get').mockReturnValue(swUrl);

      const result = await controller.get(user, ResourceTypeEnum.planets, '1');

      expect(resourceService.get).toHaveBeenCalledWith(`${swUrl}planets/1`);
      expect(resourceService.convertProtectedUrls).toHaveBeenCalledWith(planet);
      expect(result).toEqual(planet);
    });
  });
});
