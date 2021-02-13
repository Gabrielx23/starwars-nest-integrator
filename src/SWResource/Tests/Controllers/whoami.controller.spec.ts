import { Test } from '@nestjs/testing';
import { ResourceService } from '../../Services/resource.service';
import { WhoAmIController } from '../../Controllers/whoami.controller';
import { UserEntity } from '../../../User/user.entity';

const resourceServiceMock = () => ({
  get: jest.fn(),
  convertProtectedUrls: jest.fn(),
});

const user = new UserEntity();
user.password = 'password';
user.swHero = 'http://hero.url';

describe('WhoAmIWController', () => {
  let resourceService: ResourceService, controller: WhoAmIController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: ResourceService, useFactory: resourceServiceMock }],
    }).compile();

    resourceService = await module.resolve(ResourceService);
    controller = new WhoAmIController(resourceService);
  });

  describe('get', () => {
    const hero = { url: 'some.url', planets: [] };

    it('uses resource service to obtain and convert user hero', async () => {
      jest.spyOn(resourceService, 'get').mockResolvedValue(hero);
      jest.spyOn(resourceService, 'convertProtectedUrls').mockReturnValue(hero);

      await controller.get(user);

      expect(resourceService.get).toHaveBeenCalledWith(user.swHero);
      expect(resourceService.convertProtectedUrls).toBeCalledWith(hero);
    });

    it('returns hero without url', async () => {
      jest.spyOn(resourceService, 'get').mockResolvedValue(hero);
      jest.spyOn(resourceService, 'convertProtectedUrls').mockReturnValue(hero);

      const result = await controller.get(user);

      const { url, ...heroWithoutUrl } = hero;

      expect(result).toEqual(heroWithoutUrl);
    });
  });
});
