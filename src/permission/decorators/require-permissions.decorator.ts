import { SetMetadata } from '@nestjs/common';
import { Action } from '../ability.factory';

export const PERMISSIONS_KEY = 'permissions';

export interface Permission {
  action: Action | Action[];
  subject: string;
  field?: string;
}

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRead = (subject: string, field?: string) =>
  RequirePermissions({ action: Action.Read, subject, field });

export const RequireCreate = (subject: string) =>
  RequirePermissions({ action: Action.Create, subject });

export const RequireUpdate = (subject: string, field?: string) =>
  RequirePermissions({ action: Action.Update, subject, field });

export const RequireDelete = (subject: string) =>
  RequirePermissions({ action: Action.Delete, subject });

export const RequireManage = (subject: string) =>
  RequirePermissions({ action: Action.Manage, subject });
