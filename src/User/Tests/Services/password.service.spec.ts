import { Test } from '@nestjs/testing';
import { PasswordService } from '../../Services/password.service';
import * as argon2 from 'argon2';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [],
    }).compile();

    service = new PasswordService();
  });

  describe('hash', () => {
    it('returns properly hashed password', async () => {
      const hash = await service.hash('password');

      expect(await argon2.verify(hash, 'password')).toBeTruthy();
    });
  });

  describe('verify', () => {
    it('returns true if hash is correct', async () => {
      const hash = await argon2.hash('password');

      const result = await service.verify('password', hash);

      expect(result).toBeTruthy();
    });

    it('returns false if hash is incorrect', async () => {
      const hash = await argon2.hash('password1');

      const result = await service.verify('password', hash);

      expect(result).toBeFalsy();
    });
  });
});
