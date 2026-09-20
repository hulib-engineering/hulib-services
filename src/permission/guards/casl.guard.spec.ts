import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../ability.factory';
import { CaslGuard } from './casl.guard';
import { CHECK_ABILITY } from '../decorators/casl.decorator';
import { makeUser, FakeAbility } from '../permission.fixtures.spec-helpers';

describe('CaslGuard', () => {
  let guard: CaslGuard;
  let abilityFactory: { defineAbilitiesFor: jest.Mock };
  let ability: FakeAbility;

  const makeContext = (
    user?: unknown,
    handler: () => unknown = () => undefined,
  ) => {
    const request = { user };
    return {
      getHandler: () => handler,
      getClass: () => class Controller {},
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  const handlerWithAbilities = (handlers: unknown) => {
    const handler = () => undefined;
    SetMetadata(CHECK_ABILITY, handlers)(handler);
    return handler;
  };

  beforeEach(async () => {
    ability = new FakeAbility();
    abilityFactory = {
      defineAbilitiesFor: jest.fn().mockReturnValue(ability),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CaslGuard,
        Reflector,
        { provide: CaslAbilityFactory, useValue: abilityFactory },
      ],
    }).compile();

    guard = moduleRef.get<CaslGuard>(CaslGuard);
  });

  it('should throw UnauthorizedException when the request has no user', () => {
    const context = makeContext(undefined, handlerWithAbilities([() => true]));

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the user has no id', () => {
    const context = makeContext(
      { email: 'x@example.com' },
      handlerWithAbilities([() => true]),
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when ability handlers metadata is not an array', () => {
    const context = makeContext(
      makeUser(),
      handlerWithAbilities('not-an-array'),
    );

    expect(() => guard.canActivate(context)).toThrow(
      /Invalid ability handlers configuration/,
    );
  });

  it('should grant access when every handler passes', () => {
    const context = makeContext(
      makeUser(),
      handlerWithAbilities([() => true, () => true]),
    );

    expect(guard.canActivate(context)).toBe(true);
    expect(abilityFactory.defineAbilitiesFor).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
    );
    expect((context.switchToHttp().getRequest() as any).ability).toBe(ability);
  });

  it('should throw ForbiddenException when a handler rejects the request', () => {
    const context = makeContext(
      makeUser(),
      handlerWithAbilities([() => false]),
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException and log when a handler throws', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const boom = () => {
      throw new Error('boom');
    };
    const context = makeContext(makeUser(), handlerWithAbilities([boom]));

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CASL handler error:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it('should allow a request with no ability metadata when the user is authenticated', () => {
    const context = makeContext(makeUser());

    expect(guard.canActivate(context)).toBe(true);
  });
});
