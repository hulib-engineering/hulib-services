import { User } from '@users/domain/user';
import { Action } from '../ability.factory';
import { CaslAbilityFactory } from '../ability.factory';

export class PermissionUtils {
  /**
   * Check if user can perform action on subject
   */
  static can(
    abilityFactory: CaslAbilityFactory,
    user: User,
    action: Action,
    subject: any,
  ): boolean {
    const ability = abilityFactory.defineAbilitiesFor(user);
    return ability.can(action, subject);
  }

  /**
   * Check if user can perform action on specific field
   */
  static canField(
    abilityFactory: CaslAbilityFactory,
    user: User,
    action: Action,
    subject: any,
    field: string,
  ): boolean {
    const ability = abilityFactory.defineAbilitiesFor(user);
    return ability.can(action, subject, field);
  }

  /**
   * Filter object properties based on user permissions
   */
  static filterFields(
    abilityFactory: CaslAbilityFactory,
    user: User,
    subject: any,
  ): any {
    const ability = abilityFactory.defineAbilitiesFor(user);
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
   * Get allowed fields for user on subject
   */
  static getAllowedFields(
    abilityFactory: CaslAbilityFactory,
    user: User,
    subject: any,
  ): string[] {
    const ability = abilityFactory.defineAbilitiesFor(user);
    const allowedFields: string[] = [];

    if (subject && typeof subject === 'object') {
      for (const key of Object.keys(subject)) {
        if (ability.can(Action.Read, subject, key)) {
          allowedFields.push(key);
        }
      }
    }

    return allowedFields;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User): boolean {
    return user.role?.id === 1; // RoleEnum.admin
  }

  /**
   * Check if user is humanBook
   */
  static isHumanBook(user: User): boolean {
    return user.role?.id === 2; // RoleEnum.humanBook
  }

  /**
   * Check if user is reader
   */
  static isReader(user: User): boolean {
    return user.role?.id === 3; // RoleEnum.reader
  }

  /**
   * Sanitize sensitive data based on user role
   */
  static sanitizeUserData(user: User, data: any): any {
    if (!data) return data;

    const sanitized = { ...data };

    // Remove sensitive fields for non-admin users
    if (!this.isAdmin(user)) {
      delete sanitized.password;
      delete sanitized.previousPassword;
      delete sanitized.socialId;
      delete sanitized.createdAt;
      delete sanitized.updatedAt;
    }

    return sanitized;
  }
}
