import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '../ability.factory';

export const CHECK_ABILITY = 'check_ability';
export type AbilityHandler = (ability: AppAbility) => boolean;

export const CheckAbilities = (...handlers: AbilityHandler[]) =>
  SetMetadata(CHECK_ABILITY, handlers);
