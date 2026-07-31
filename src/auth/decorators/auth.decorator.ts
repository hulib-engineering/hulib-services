import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@roles/roles.guard';
import { Roles } from '@roles/roles.decorator';
import { CaslGuard } from '@permission/guards/casl.guard';
import {
  AbilityHandler,
  CheckAbilities,
} from '@permission/decorators/casl.decorator';

export const AuthRoles = (...roles: number[]) =>
  applyDecorators(
    ApiBearerAuth(),
    Roles(...roles),
    UseGuards(AuthGuard('jwt'), RolesGuard),
  );

export const AuthAbilities = (...handlers: AbilityHandler[]) =>
  applyDecorators(
    ApiBearerAuth(),
    CheckAbilities(...handlers),
    UseGuards(AuthGuard('jwt'), CaslGuard),
  );
