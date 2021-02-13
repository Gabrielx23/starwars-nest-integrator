import { CACHE_MANAGER, HttpService, Inject, Injectable } from '@nestjs/common';
import { SWResourceException } from '../sw-resource.exception';
import { Cache } from 'cache-manager';

@Injectable()
export class ResourceClient {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  public async getResource(url: string): Promise<any> {
    let value = await this.cacheManager.get(url);

    if (value) {
      return value;
    }

    const call = this.httpService.get(url);

    value = await call
      .toPromise()
      .then((response) => response.data)
      .catch(() => {
        throw SWResourceException.couldNotObtainDataFromSWApi();
      });

    await this.cacheManager.set(url, value, { ttl: 1000 * 60 * 24 });

    return value;
  }
}
