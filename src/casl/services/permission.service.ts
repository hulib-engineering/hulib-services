import { Injectable } from '@nestjs/common';
import { CaslAbilityFactory, Action } from '../ability.factory';
import { User } from '@users/domain/user';

@Injectable()
export class PermissionService {
  constructor(private readonly abilityFactory: CaslAbilityFactory) {}

  /**
   * Check if user can perform action on subject
   */
  can(user: User, action: Action, subject: any): boolean {
    const ability = this.abilityFactory.defineAbilitiesFor(user);
    return ability.can(action, subject);
  }

  /**
   * Check if user can perform action on specific field of subject
   */
  canField(user: User, action: Action, subject: any, field: string): boolean {
    const ability = this.abilityFactory.defineAbilitiesFor(user);
    return ability.can(action, subject, field);
  }

  /**
   * Get all allowed fields for user on subject
   */
  getAllowedFields(user: User, subject: any): string[] {
    const ability = this.abilityFactory.defineAbilitiesFor(user);
    // const subjectType = ability.detectSubjectType(subject);

    // This is a simplified implementation
    // In a real scenario, you might want to store field permissions in a more structured way
    const commonFields = ['id', 'title', 'content', 'name', 'description'];
    const allowedFields: string[] = [];

    for (const field of commonFields) {
      if (ability.can(Action.Read, subject, field)) {
        allowedFields.push(field);
      }
    }

    return allowedFields;
  }

  /**
   * Filter object based on user permissions
   */
  filterObject(user: User, subject: any): any {
    const ability = this.abilityFactory.defineAbilitiesFor(user);
    const filtered: any = {};

    if (subject && typeof subject === 'object') {
      for (const [key, value] of Object.entries(subject)) {
        if (ability.can(Action.Read, subject, key)) {
          filtered[key] = value;
        }
      }
    }

    return filtered;
  }

  /**
   * TODO: Verify roleId is correct
   */
  /**
   * Check if user has admin role
   */
  isAdmin(user: User): boolean {
    return user.role?.id === 1; // RoleEnum.admin
  }

  /**
   * Check if user has humanBook role
   */
  isHumanBook(user: User): boolean {
    return user.role?.id === 2; // RoleEnum.humanBook
  }

  /**
   * Check if user has reader role
   */
  isReader(user: User): boolean {
    return user.role?.id === 3; // RoleEnum.reader
  }
}
