import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ResourceClient } from '../../Clients/resource.client';
import { ResourceService } from '../../Services/resource.service';
import { EnvKeyEnum } from '../../../env-key.enum';

const resourceClientMock = () => ({
  getResource: jest.fn(),
});

const configServiceMock = () => ({
  get: jest.fn(),
});

describe('ResourceService', () => {
  let service: ResourceService, resourceClient: ResourceClient, config: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: ResourceClient, useFactory: resourceClientMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    resourceClient = await module.resolve(ResourceClient);
    config = await module.resolve(ConfigService);
    service = new ResourceService(resourceClient, config);
  });

  describe('getAll', () => {
    const urls = ['http://url1', 'http://url2'];
    const resource = { characters: [] };

    it('uses resource client to obtain all resources', async () => {
      jest.spyOn(resourceClient, 'getResource').mockResolvedValue(resource);
      jest.spyOn(config, 'get').mockReturnValue('');

      await service.getAll(urls);

      expect(resourceClient.getResource).toHaveBeenNthCalledWith(1, urls[0]);
      expect(resourceClient.getResource).toHaveBeenNthCalledWith(2, urls[1]);
    });

    it('returns array of obtained resources', async () => {
      jest.spyOn(resourceClient, 'getResource').mockResolvedValue(resource);
      jest.spyOn(config, 'get').mockReturnValue('');

      const result = await service.getAll(urls);

      expect(result).toEqual([resource, resource]);
    });
  });

  describe('get', () => {
    const resource = { characters: [] };

    it('uses resource client to resource', async () => {
      jest.spyOn(resourceClient, 'getResource').mockResolvedValue(resource);

      await service.get('url');

      expect(resourceClient.getResource).toHaveBeenCalledWith('url');
    });

    it('returns obtained resource', async () => {
      jest.spyOn(resourceClient, 'getResource').mockResolvedValue(resource);

      const result = await service.get('url');

      expect(result).toEqual(resource);
    });
  });

  describe('convertProtectedUrls', () => {
    const swUrl = 'http://sw.com/';
    const appUrl = 'http://app.com/';

    const resource = {
      planets: [`${swUrl}planets/1`, `${swUrl}planets/5`],
      films: [`${swUrl}films/1`, `${swUrl}films/5`],
    };

    const convertedResource = {
      planets: [`${appUrl}sw/planets/1`, `${appUrl}sw/planets/5`],
      films: [`${appUrl}sw/films/1`, `${appUrl}sw/films/5`],
    };

    it('uses config service to obtain sw and app url', async () => {
      jest.spyOn(config, 'get').mockReturnValue('uri');

      await service.convertProtectedUrls(resource);

      expect(config.get).toBeCalledWith(EnvKeyEnum.AppUrl);
      expect(config.get).toBeCalledWith(EnvKeyEnum.SWEndpoint);
    });

    it('returns converted resource ', async () => {
      jest.spyOn(config, 'get').mockReturnValueOnce(appUrl).mockReturnValueOnce(swUrl);

      const result = await service.convertProtectedUrls(resource);

      expect(result).toEqual(convertedResource);
    });
  });
});
