import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class SWResourceException {
  public static couldNotObtainDataFromSWApi(): NotFoundException {
    return new NotFoundException('Could not obtain data from Star Wars API!');
  }

  public static resourceIsRestricted(): ForbiddenException {
    return new ForbiddenException('This resource is restricted for you!');
  }
}
