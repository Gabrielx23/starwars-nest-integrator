import { Injectable } from '@nestjs/common';
import { ResourceClient } from '../Clients/resource.client';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../env-key.enum';
import { ResourceTypeEnum } from '../Enum/resource-type.enum';

@Injectable()
export class ResourceService {
  private static APP_RESOURCE_ENDPOINT = 'sw/';

  constructor(
    private readonly resourceClient: ResourceClient,
    private readonly configService: ConfigService,
  ) {}

  public async getAll(urls: Array<string>): Promise<Array<object>> {
    const resources = [];

    for (const url of urls) {
      try {
        const resource = await this.resourceClient.getResource(url);
        resources.push(this.convertProtectedUrls(resource));
      } catch (err) {}
    }

    return resources;
  }

  public async get(url: string) {
    return await this.resourceClient.getResource(url);
  }

  public convertProtectedUrls(resource: object): object {
    const appUrl = this.configService.get(EnvKeyEnum.AppUrl);
    const swEndpoint = this.configService.get(EnvKeyEnum.SWEndpoint);

    let jsonResource = JSON.stringify(resource);

    for (const resourceType of Object.values(ResourceTypeEnum)) {
      jsonResource = jsonResource.replace(
        new RegExp(`${swEndpoint}${resourceType}`, 'g'),
        `${appUrl}${ResourceService.APP_RESOURCE_ENDPOINT}${resourceType}`,
      );
    }

    return JSON.parse(jsonResource);
  }
}
