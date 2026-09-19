import { CaslAbilityFactory, Action } from './ability.factory';
import { makeUser } from './permission.fixtures.spec-helpers';
import { RoleEnum } from '@roles/roles.enum';
import { User } from '@users/domain/user';

describe('CaslAbilityFactory', () => {
  const factory = new CaslAbilityFactory();

  const abilityFor = (roleId: number) =>
    factory.defineAbilitiesFor(makeUser({ role: { id: roleId } }));

  const withRole = (roleId: number): User => makeUser({ role: { id: roleId } });

  // ── Admin (RoleEnum.admin = 1) ────────────────────────────────────────────
  describe('Admin', () => {
    const ability = abilityFor(RoleEnum.admin);

    it('should let admin manage everything', () => {
      expect(ability.can(Action.Manage, 'all')).toBe(true);
      expect(ability.can(Action.Read, 'Story')).toBe(true);
      expect(ability.can(Action.Create, 'ReadingSession')).toBe(true);
      expect(ability.can(Action.Update, 'User')).toBe(true);
    });

    it('should not be restricted by sensitive field rules', () => {
      expect(ability.can(Action.Read, 'User', 'password')).toBe(true);
      expect(ability.can(Action.Read, 'User', 'socialId')).toBe(true);
      expect(ability.can(Action.Read, 'User', 'createdAt')).toBe(true);
    });
  });

  // ── HumanBook (RoleEnum.humanBook = 2) ────────────────────────────────────
  describe('HumanBook', () => {
    const ability = abilityFor(RoleEnum.humanBook);

    it.each([
      [Action.Read, 'User'],
      [Action.Update, 'User'],
      [Action.Create, 'ReadingSession'],
      [Action.Read, 'ReadingSession'],
      [Action.Update, 'ReadingSession'],
      [Action.Cancel, 'ReadingSession'],
      [Action.Create, 'Story'],
      [Action.Read, 'Story'],
      [Action.Update, 'Story'],
      [Action.Delete, 'Story'],
      [Action.Publish, 'Story'],
      [Action.Unpublish, 'Story'],
      [Action.Read, 'Topic'],
      [Action.Create, 'TimeSlot'],
      [Action.Update, 'TimeSlot'],
      [Action.Delete, 'TimeSlot'],
      [Action.Create, 'Schedule'],
      [Action.Update, 'Schedule'],
      [Action.Create, 'Message'],
      [Action.Read, 'Message'],
      [Action.Update, 'Message'],
      [Action.Read, 'Feedback'],
      [Action.Create, 'Feedback'],
      [Action.Create, 'File'],
      [Action.Read, 'File'],
      [Action.Update, 'File'],
      [Action.Read, 'StoryReview'],
      [Action.Read, 'StoryFavorite'],
      [Action.Create, 'Notification'],
      [Action.Read, 'Notification'],
    ] as const)('can %s %s', (action, subject) => {
      expect(ability.can(action, subject)).toBe(true);
    });

    it.each([
      [Action.Manage, 'all'],
      [Action.Update, 'Topic'],
      [Action.Delete, 'File'],
      [Action.Update, 'StoryReview'],
      [Action.Create, 'StoryFavorite'],
      [Action.Create, 'StoryReview'],
      [Action.Manage, 'Topic'],
    ] as const)('cannot %s %s', (action, subject) => {
      expect(ability.can(action, subject)).toBe(false);
    });

    it('should be blocked from reading sensitive user fields', () => {
      expect(ability.can(Action.Read, 'User', 'password')).toBe(false);
      expect(ability.can(Action.Read, 'User', 'previousPassword')).toBe(false);
      expect(ability.can(Action.Read, 'User', 'socialId')).toBe(false);
      expect(ability.can(Action.Read, 'User', 'createdAt')).toBe(false);
      expect(ability.can(Action.Read, 'User', 'updatedAt')).toBe(false);
    });
  });

  // ── Reader (RoleEnum.reader = 3) ──────────────────────────────────────────
  describe('Reader', () => {
    const ability = abilityFor(RoleEnum.reader);

    it.each([
      [Action.Read, 'User'],
      [Action.Update, 'User'],
      [Action.Create, 'ReadingSession'],
      [Action.Read, 'ReadingSession'],
      [Action.Cancel, 'ReadingSession'],
      [Action.Read, 'Story'],
      [Action.Read, 'Topic'],
      [Action.Create, 'StoryReview'],
      [Action.Read, 'StoryReview'],
      [Action.Update, 'StoryReview'],
      [Action.Create, 'StoryFavorite'],
      [Action.Delete, 'StoryFavorite'],
      [Action.Create, 'Message'],
      [Action.Read, 'Message'],
      [Action.Update, 'Message'],
      [Action.Create, 'Feedback'],
      [Action.Create, 'Notification'],
      [Action.Read, 'Notification'],
    ] as const)('can %s %s', (action, subject) => {
      expect(ability.can(action, subject)).toBe(true);
    });

    it.each([
      [Action.Manage, 'all'],
      [Action.Create, 'Story'],
      [Action.Publish, 'Story'],
      [Action.Delete, 'Story'],
      [Action.Update, 'Topic'],
      [Action.Create, 'File'],
      [Action.Update, 'File'],
      [Action.Delete, 'File'],
      [Action.Create, 'TimeSlot'],
      [Action.Update, 'StoryFavorite'],
    ] as const)('cannot %s %s', (action, subject) => {
      expect(ability.can(action, subject)).toBe(false);
    });

    it('should be blocked from reading sensitive user fields', () => {
      expect(ability.can(Action.Read, 'User', 'password')).toBe(false);
      expect(ability.can(Action.Read, 'User', 'socialId')).toBe(false);
    });
  });

  // ── Guest (RoleEnum.guest = 4) ────────────────────────────────────────────
  describe('Guest', () => {
    const ability = abilityFor(RoleEnum.guest);

    it('should read only the whitelisted user fields', () => {
      for (const field of ['id', 'fullName', 'photo', 'bio', 'role']) {
        expect(ability.can(Action.Read, 'User', field)).toBe(true);
      }
    });

    it('should read only the whitelisted story fields', () => {
      for (const field of [
        'id',
        'title',
        'abstract',
        'cover',
        'humanBook',
        'topics',
      ]) {
        expect(ability.can(Action.Read, 'Story', field)).toBe(true);
      }
    });

    it.each([
      [Action.Read, 'Story', 'viewCount'],
      [Action.Read, 'Story', 'likeCount'],
      [Action.Read, 'User', 'password'],
    ] as const)('cannot read %s %s field %s', (action, subject, field) => {
      expect(ability.can(action, subject, field)).toBe(false);
    });

    it.each([
      [Action.Manage, 'all'],
      [Action.Update, 'User'],
      [Action.Create, 'Story'],
      [Action.Create, 'ReadingSession'],
      [Action.Create, 'Message'],
      [Action.Create, 'Feedback'],
      [Action.Update, 'Topic'],
    ] as const)('cannot %s %s', (action, subject) => {
      expect(ability.can(action, subject)).toBe(false);
    });
  });

  // ── Base rules shared by every authenticated user ─────────────────────────
  describe('Common base rules', () => {
    it('should let admin/humanBook/reader update/read a User via subject type', () => {
      for (const roleId of [
        RoleEnum.admin,
        RoleEnum.humanBook,
        RoleEnum.reader,
      ]) {
        const ability = abilityFor(roleId);
        expect(ability.can(Action.Update, 'User')).toBe(true);
        expect(ability.can(Action.Read, 'User')).toBe(true);
      }
    });

    it('should deny guest the ability to update any User', () => {
      const ability = abilityFor(RoleEnum.guest);
      expect(ability.can(Action.Update, 'User')).toBe(false);
    });
  });

  // ── Public helper methods ─────────────────────────────────────────────────
  describe('helper methods', () => {
    it('should check manage permissions via canUserManageResource with string subjects', () => {
      const admin = factory.canUserManageResource(
        withRole(RoleEnum.admin),
        Action.Manage,
        'all',
      );
      expect(admin).toBe(true);

      const reader = factory.canUserManageResource(
        withRole(RoleEnum.reader),
        Action.Manage,
        'all',
      );
      expect(reader).toBe(false);
    });

    it('should respect field rules via canUserAccessField for string subjects', () => {
      const admin = factory.canUserAccessField(
        withRole(RoleEnum.admin),
        'User',
        'password',
      );
      expect(admin).toBe(true);

      const reader = factory.canUserAccessField(
        withRole(RoleEnum.reader),
        'User',
        'password',
      );
      expect(reader).toBe(false);
    });

    it('should return the static common field list from getAllowedFields', () => {
      expect(factory.getAllowedFields()).toEqual(['id', 'title', 'content']);
    });
  });

  // ── Known defects / current runtime behavior ──────────────────────────────
  // The factory configures `detectSubjectType: (item) => item`, so object
  // subjects are NOT valid — CASL throws instead of evaluating rules. These
  // tests pin the current behavior so a refactor can't silently change it.
  describe('runtime defects (pinned current behavior)', () => {
    it('should throw when an object instance is passed as subject', () => {
      const reader = withRole(RoleEnum.reader);
      expect(() =>
        factory.canUserManageResource(reader, Action.Read, { id: 9 }),
      ).toThrow(/accepts only subject types/);
      expect(() => factory.canUserAccessField(reader, { id: 9 }, 'id')).toThrow(
        /accepts only subject types/,
      );
    });

    it('should expose the guest user-field allow-list gap (email readable)', () => {
      // The base `can(Read, 'User', condition)` rule covers ALL fields and the
      // condition is never evaluated for string subjects, so the guest can
      // read `email` even though it is not in the whitelist.
      const ability = abilityFor(RoleEnum.guest);
      expect(ability.can(Action.Read, 'User', 'email')).toBe(true);
      expect(ability.can(Action.Read, 'User', 'phoneNumber')).toBe(true);
    });

    it('should treat ownership conditions as always-true for string subjects', () => {
      // e.g. `can(Read, 'ReadingSession', (s) => s.readerId === user.id)` grants
      // access to ANY ReadingSession when checked by subject type only.
      const reader = abilityFor(RoleEnum.reader);
      expect(reader.can(Action.Read, 'ReadingSession')).toBe(true);
      expect(reader.can(Action.Delete, 'StoryFavorite')).toBe(true);

      const humanBook = abilityFor(RoleEnum.humanBook);
      expect(humanBook.can(Action.Publish, 'Story')).toBe(true);
      expect(humanBook.can(Action.Delete, 'Story')).toBe(true);
    });

    it('should not enforce topic status conditions for string subjects', () => {
      // The rule carries `{ status: TopicStatus.active }` but the object does
      // not drive the decision when checking by subject type, so the status
      // gate only ever applies via object subjects, which currently throw.
      const ability = abilityFor(RoleEnum.humanBook);
      expect(ability.can(Action.Read, 'Topic')).toBe(true);
    });
  });
});
