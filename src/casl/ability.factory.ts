import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { RoleEnum } from '../roles/roles.enum';
import { User } from '../users/domain/user';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subjects = InferSubjects<'User' | 'all'>;

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  defineAbilitiesFor(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      PureAbility<[Action, Subjects]>
    >(PureAbility as AbilityClass<AppAbility>);

    const roleId = user.role?.id;

    const permissions = {
      [RoleEnum.admin]: () => can(Action.Manage, 'all'),
      [RoleEnum.humanBook]: () => {
        can(Action.Read, 'User');
        can(Action.Update, 'User');
      },
      [RoleEnum.reader]: () => can(Action.Read, 'User'),
      [RoleEnum.guest]: () => {
        can(Action.Read, 'User');
        cannot(Action.Update, 'User');
      },
    };

    if (roleId) {
      permissions[roleId]();
    }

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<Subjects>,
    });
  }
}
