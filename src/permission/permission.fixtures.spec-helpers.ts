import type { User } from '@users/domain/user';

/**
 * Lightweight User builder for permission tests.
 *
 * The ability factory only ever reads `user.id` and `user.role.id`, so the
 * plain object is a valid stand-in even though the domain class declares more
 * required fields.
 */
export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'test@example.com',
    password: 'hashed-password',
    provider: 'email',
    fullName: 'Test User',
    role: { id: 1 },
    status: { id: 1 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  } as User;
}

/**
 * Test double for a CASL `PureAbility`. Records every `.can(...)` call so a
 * spec can assert both the returned decision and the exact arguments that were
 * forwarded to the ability instance.
 */
export class FakeAbility {
  can: jest.Mock = jest.fn();

  constructor(
    canImpl?: (action: string, subject: unknown, field?: string) => boolean,
  ) {
    if (canImpl) {
      this.can = jest.fn(canImpl);
    }
  }
}

/** Stub for `CaslAbilityFactory` that hands every call the same fake ability. */
export function makeAbilityFactoryStub(ability: FakeAbility | undefined) {
  return {
    defineAbilitiesFor: jest.fn().mockReturnValue(ability ?? new FakeAbility()),
  };
}
