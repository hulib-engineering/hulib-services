import {
  AbilityBuilder,
  ExtractSubjectType,
  FieldMatcher,
  InferSubjects,
  MatchConditions,
  PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { RoleEnum } from '@roles/roles.enum';
import { User } from '@users/domain/user';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Approve = 'approve',
  Reject = 'reject',
  Publish = 'publish',
  Unpublish = 'unpublish',
  Join = 'join',
  Leave = 'leave',
  Rate = 'rate',
  Review = 'review',
  Schedule = 'schedule',
  Cancel = 'cancel',
  Archive = 'archive',
  Restore = 'restore',
}

type Subjects = InferSubjects<
  | 'User'
  | 'ReadingSession'
  | 'ReadingSessionParticipant'
  | 'Story'
  | 'Topic'
  | 'StoryReview'
  | 'StoryFavorite'
  | 'TimeSlot'
  | 'Schedule'
  | 'Notification'
  | 'Message'
  | 'Feedback'
  | 'File'
  | 'all'
>;

export type AppAbility = PureAbility<[Action, Subjects], MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;
const fieldMatcher: FieldMatcher = (fields) => (field) =>
  fields.includes(field);

@Injectable()
export class CaslAbilityFactory {
  defineAbilitiesFor(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

    const roleId = user.role?.id;

    // Base permissions for all authenticated users
    can(Action.Update, 'User', (subject: any) => subject.id === user.id);
    can(Action.Read, 'User', (subject: any) => subject.id === user.id);

    if (roleId === RoleEnum.admin) {
      // Admin has full access to everything
      can(Action.Manage, 'all');
    } else if (roleId === RoleEnum.humanBook) {
      // HumanBook permissions
      this.defineHumanBookPermissions(can, cannot, user);
    } else if (roleId === RoleEnum.reader) {
      // Reader permissions
      this.defineReaderPermissions(can, cannot, user);
    } else if (roleId === RoleEnum.guest) {
      // Guest permissions (limited read access)
      this.defineGuestPermissions(can, cannot);
    }

    // Field-level permissions for sensitive data
    this.defineFieldPermissions(can, cannot, user);

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<Subjects>,
      conditionsMatcher: lambdaMatcher,
      fieldMatcher,
    });
  }

  private defineHumanBookPermissions(can: any, cannot: any, user: User): void {
    // User management
    can(Action.Read, 'User');
    can(Action.Update, 'User', (subject: any) => subject.id === user.id);

    // Reading sessions
    can(Action.Create, 'ReadingSession');
    can(
      [Action.Read, Action.Update, Action.Cancel],
      'ReadingSession',
      (subject: any) =>
        subject.readerId === user.id || subject.humanBookId === user.id,
    );

    // Stories
    can(Action.Create, 'Story');
    can(
      [
        Action.Read,
        Action.Update,
        Action.Delete,
        Action.Publish,
        Action.Unpublish,
      ],
      'Story',
      (subject: any) => subject.humanBookId === user.id,
    );

    // Topics
    can(Action.Read, 'Topic');

    // Time slots
    can([Action.Create, Action.Read, Action.Update, Action.Delete], 'TimeSlot');

    // Schedules
    can([Action.Create, Action.Read, Action.Update, Action.Delete], 'Schedule');

    // Messages
    can([Action.Create, Action.Read, Action.Update], 'Message');

    // Feedback
    can([Action.Read, Action.Create], 'Feedback');

    // Files
    can([Action.Create, Action.Read, Action.Update], 'File');

    // Story reviews (read only)
    can(Action.Read, 'StoryReview');

    // Story favorites (read only)
    can(Action.Read, 'StoryFavorite');

    // Notifications
    can([Action.Create, Action.Read], 'Notification');
  }

  private defineReaderPermissions(can: any, cannot: any, user: User): void {
    // User management
    can(Action.Read, 'User');
    can(Action.Update, 'User', (subject: any) => subject.id === user.id);

    // Reading sessions
    can(Action.Create, 'ReadingSession');
    can(
      [Action.Read, Action.Update, Action.Cancel],
      'ReadingSession',
      (subject: any) => subject.readerId === user.id,
    );

    // Stories (read only)
    can(Action.Read, 'Story');

    // Topics
    can(Action.Read, 'Topic');

    // Story reviews
    can(
      [Action.Create, Action.Read, Action.Update],
      'StoryReview',
      (subject: any) => subject.userId === user.id,
    );

    // Story favorites
    can(
      [Action.Create, Action.Delete],
      'StoryFavorite',
      (subject: any) => subject.userId === user.id,
    );

    // Messages
    can([Action.Create, Action.Read, Action.Update], 'Message');

    // Feedback
    can(Action.Create, 'Feedback');

    // Notifications
    can([Action.Create, Action.Read], 'Notification');
  }

  private defineGuestPermissions(can: any, cannot: any): void {
    // Limited user access
    can(Action.Read, 'User', ['id', 'fullName', 'photo', 'bio', 'role']);

    // Limited story access
    can(Action.Read, 'Story', [
      'id',
      'title',
      'abstract',
      'cover',
      'humanBook',
      'topics',
    ]);

    // Topics
    can(Action.Read, 'Topic');

    // Cannot update user
    cannot(Action.Update, 'User');
  }

  private defineFieldPermissions(can: any, cannot: any, user: User): void {
    const roleId = user.role?.id;

    // Hide sensitive fields for non-admin users
    if (roleId !== RoleEnum.admin) {
      cannot(Action.Read, 'User', ['password', 'previousPassword', 'socialId']);
      cannot(Action.Read, 'User', ['createdAt', 'updatedAt']);
    }

    // Guest field restrictions
    if (roleId === RoleEnum.guest) {
      can(Action.Read, 'User', ['id', 'fullName', 'photo', 'bio', 'role']);
      can(Action.Read, 'Story', [
        'id',
        'title',
        'abstract',
        'cover',
        'humanBook',
        'topics',
      ]);
    }
  }

  // Helper methods for checking permissions
  canUserManageResource(user: User, action: Action, subject: any): boolean {
    const ability = this.defineAbilitiesFor(user);
    return ability.can(action, subject);
  }

  canUserAccessField(user: User, subject: any, field: string): boolean {
    const ability = this.defineAbilitiesFor(user);
    return ability.can(Action.Read, subject, field);
  }

  getAllowedFields(): string[] {
    // Return common fields that most users can access
    return ['id', 'title', 'content'];
  }
}
