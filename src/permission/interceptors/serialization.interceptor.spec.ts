import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { CaslAbilityFactory } from '../ability.factory';
import { CaslSerializationInterceptor } from './serialization.interceptor';
import { makeUser, FakeAbility } from '../permission.fixtures.spec-helpers';

describe('CaslSerializationInterceptor', () => {
  let interceptor: CaslSerializationInterceptor;
  let abilityFactory: { defineAbilitiesFor: jest.Mock };
  let ability: FakeAbility;

  const makeContext = (user: unknown) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  const run = async (
    data: unknown,
    user: unknown,
    canImpl?: (action: string, subject: unknown, field: string) => boolean,
  ) => {
    if (canImpl) {
      ability.can = jest.fn(canImpl);
    }
    const result$ = interceptor.intercept(makeContext(user), {
      handle: () => of(data),
    } as unknown as CallHandler);
    return lastValueFrom(result$);
  };

  beforeEach(async () => {
    ability = new FakeAbility();
    abilityFactory = { defineAbilitiesFor: jest.fn().mockReturnValue(ability) };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CaslSerializationInterceptor,
        { provide: CaslAbilityFactory, useValue: abilityFactory },
      ],
    }).compile();

    interceptor = moduleRef.get<CaslSerializationInterceptor>(
      CaslSerializationInterceptor,
    );
  });

  it('should pass data through untouched when there is no user', async () => {
    const data = { id: 1, password: 'secret' };
    const result = await run(data, undefined);

    expect(result).toEqual(data);
    expect(abilityFactory.defineAbilitiesFor).not.toHaveBeenCalled();
  });

  it('should keep only the fields the ability allows to read', async () => {
    const user = makeUser();
    const result = await run(
      { id: 1, email: 'a@b.com', password: 'secret' },
      user,
      (_action, _subject, field) => field !== 'password',
    );

    expect(result).toEqual({ id: 1, email: 'a@b.com' });
    expect(abilityFactory.defineAbilitiesFor).toHaveBeenCalledWith(user);
  });

  it('should recursively sanitize nested objects', async () => {
    const user = makeUser();
    const result = await run(
      { id: 1, profile: { bio: 'hi', password: 'x' } },
      user,
      (_action, _subject, field) => field !== 'password',
    );

    expect(result).toEqual({ id: 1, profile: { bio: 'hi' } });
  });

  it('should sanitize every item in an array', async () => {
    const user = makeUser();
    const result = await run(
      [
        { id: 1, password: 'a' },
        { id: 2, password: 'b' },
      ],
      user,
      (_action, _subject, field) => field !== 'password',
    );

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should keep primitive and null values as-is', async () => {
    const user = makeUser();
    const result = await run(
      { id: 1, note: null, tags: ['a', 'b'] },
      user,
      (_action, _subject, field) => ['id', 'note', 'tags'].includes(field),
    );

    expect(result).toEqual({ id: 1, note: null, tags: ['a', 'b'] });
  });

  it('should drop fields the ability denies, including nested sensitive data', async () => {
    const user = makeUser();
    const calls: string[] = [];
    const result = await run(
      { id: 1, user: { socialId: '12', id: 7 } },
      user,
      (action, subject, field) => {
        calls.push(field);
        return field !== 'socialId';
      },
    );

    expect(result).toEqual({ id: 1, user: { id: 7 } });
    expect(calls).toContain('socialId');
  });
});
