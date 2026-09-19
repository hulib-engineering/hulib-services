import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory, Action } from '../ability.factory';
import { PermissionService } from './permission.service';
import { makeUser, FakeAbility } from '../permission.fixtures.spec-helpers';
import { RoleEnum } from '@roles/roles.enum';
import { TopicStatus } from '@topics/topic-status.enum';

describe('PermissionService', () => {
  let service: PermissionService;
  let abilityFactory: { defineAbilitiesFor: jest.Mock };
  let ability: FakeAbility;

  beforeEach(async () => {
    ability = new FakeAbility();
    abilityFactory = {
      defineAbilitiesFor: jest.fn().mockReturnValue(ability),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: CaslAbilityFactory, useValue: abilityFactory },
      ],
    }).compile();

    service = moduleRef.get<PermissionService>(PermissionService);
  });

  describe('can', () => {
    it('should delegate to the ability built for the user', () => {
      const user = makeUser();
      ability.can.mockReturnValue(true);

      const result = service.can(user, Action.Update, 'User');

      expect(abilityFactory.defineAbilitiesFor).toHaveBeenCalledWith(user);
      expect(ability.can).toHaveBeenCalledWith(Action.Update, 'User');
      expect(result).toBe(true);
    });
  });

  describe('canField', () => {
    it('should check the action, subject and field against the ability', () => {
      const user = makeUser();
      ability.can.mockReturnValue(false);

      const result = service.canField(user, Action.Read, 'User', 'password');

      expect(ability.can).toHaveBeenCalledWith(Action.Read, 'User', 'password');
      expect(result).toBe(false);
    });
  });

  describe('getAllowedFields', () => {
    it('should return the common fields the ability allows to read', () => {
      const user = makeUser();
      ability.can.mockImplementation((_action, _subject, field) =>
        ['id', 'title'].includes(field),
      );

      expect(
        service.getAllowedFields(user, { id: 1, title: 'x', random: 2 }),
      ).toEqual(['id', 'title']);
    });
  });

  describe('filterObject', () => {
    it('should keep only fields the ability allows to read', () => {
      const user = makeUser();
      ability.can.mockImplementation(
        (_action, _subject, field) => field !== 'password',
      );

      const filtered = service.filterObject(user, {
        id: 1,
        email: 'a@b.com',
        password: 'secret',
      });

      expect(filtered).toEqual({ id: 1, email: 'a@b.com' });
    });

    it('should return an empty object when the subject is null or primitive', () => {
      const user = makeUser();
      expect(service.filterObject(user, null)).toEqual({});
      expect(service.filterObject(user, 42)).toEqual({});
    });
  });

  describe('role checks', () => {
    it('should match role id 1 (RoleEnum.admin) via isAdmin', () => {
      expect(service.isAdmin(makeUser({ role: { id: 1 } }))).toBe(true);
      expect(service.isAdmin(makeUser({ role: { id: 3 } }))).toBe(false);
      expect(service.isAdmin(makeUser({ role: null }))).toBe(false);
    });

    it('should match role id 2 (RoleEnum.humanBook) via isHumanBook', () => {
      expect(service.isHumanBook(makeUser({ role: { id: 2 } }))).toBe(true);
      expect(service.isHumanBook(makeUser({ role: { id: 1 } }))).toBe(false);
    });

    it('should match role id 3 (RoleEnum.reader) via isReader', () => {
      expect(service.isReader(makeUser({ role: { id: 3 } }))).toBe(true);
      expect(service.isReader(makeUser({ role: { id: 4 } }))).toBe(false);
    });
  });

  describe('topic permissions', () => {
    it('should report canManageTopics when the ability can manage all or Topic', () => {
      const user = makeUser({ role: { id: RoleEnum.admin } });
      ability.can.mockImplementation((action, subject) =>
        action === Action.Manage && subject === 'all' ? true : false,
      );
      expect(service.canManageTopics(user)).toBe(true);

      ability.can.mockImplementation((action, subject) =>
        action === Action.Manage && subject === 'Topic' ? true : false,
      );
      expect(service.canManageTopics(user)).toBe(true);

      ability.can.mockReturnValue(false);
      expect(
        service.canManageTopics(makeUser({ role: { id: RoleEnum.reader } })),
      ).toBe(false);
    });

    it('should allow any status for topic managers via canReadTopic', () => {
      const admin = makeUser({ role: { id: RoleEnum.admin } });
      ability.can.mockReturnValue(true);
      expect(
        service.canReadTopic(admin, { status: TopicStatus.inactive }),
      ).toBe(true);
    });

    it('should allow only active topics for non-managers via canReadTopic', () => {
      const reader = makeUser({ role: { id: RoleEnum.reader } });
      ability.can.mockReturnValue(false);
      expect(service.canReadTopic(reader, { status: TopicStatus.active })).toBe(
        true,
      );
      expect(
        service.canReadTopic(reader, { status: TopicStatus.inactive }),
      ).toBe(false);
    });
  });
});
