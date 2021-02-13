import { BadRequestException } from '@nestjs/common';

export class SWResourceException {
  public static couldNotObtainDataFromSWApi(): BadRequestException {
    return new BadRequestException('Could not obtain data from Star Wars API!');
  }
}
