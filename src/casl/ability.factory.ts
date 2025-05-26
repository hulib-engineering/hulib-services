import {
  AbilityBuilder,
  ExtractSubjectType,
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
}

type Subjects = InferSubjects<
  | 'User'
  | 'ReadingSession'
  | 'ReadingSessionParticipant'
  | 'Story'
  | 'Topic'
  | 'all'
>;

export type AppAbility = PureAbility<[Action, Subjects], MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class CaslAbilityFactory {
  defineAbilitiesFor(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    const roleId = user.role?.id;

    if (roleId === RoleEnum.admin) {
      can(Action.Manage, 'all');
    } else if (roleId === RoleEnum.humanBook) {
      can(Action.Read, 'User');
      can(Action.Update, 'User');
      can(Action.Create, 'ReadingSession');
      can(
        [Action.Read, Action.Update],
        'ReadingSession',
        ({ readerId, humanBookId }) =>
          readerId === user.id || humanBookId === user.id,
      );
      can(Action.Read, 'Topic', ['topic.id', 'topic.name']);
    } else if (roleId === RoleEnum.reader) {
      can(Action.Read, 'User');
      can(Action.Create, 'ReadingSession');
      can(
        [Action.Read, Action.Update],
        'ReadingSession',
        ({ readerId }: { readerId: string | number }) => readerId === user.id,
      );
      can(Action.Read, 'Topic', ['topic.id', 'topic.name']);
    }

    // const permissions = {
    //   [RoleEnum.admin]: () => can(Action.Manage, 'all'),
    //   [RoleEnum.humanBook]: () => {
    //     can(Action.Read, 'User');
    //     can(Action.Update, 'User');
    //     can(Action.Create, 'ReadingSession');
    //     can(Action.Read, 'ReadingSession');
    //     can(Action.Update, 'ReadingSession');
    //     can(Action.Delete, 'ReadingSession');
    //   },
    //   [RoleEnum.reader]: () => {
    //     can(Action.Read, 'User');
    //     can(
    //       [Action.Read, Action.Update],
    //       'ReadingSession',
    //       ({ readerId }: { readerId: string | number }) => readerId === user.id,
    //     );
    //   },
    //   [RoleEnum.guest]: () => {
    //     can(Action.Read, 'User');
    //     can(Action.Read, 'ReadingSession');
    //     cannot(Action.Update, 'User');
    //   },
    // };
    //
    // if (roleId) {
    //   permissions[roleId]();
    // }

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<Subjects>,
      conditionsMatcher: lambdaMatcher,
    });
  }
}
