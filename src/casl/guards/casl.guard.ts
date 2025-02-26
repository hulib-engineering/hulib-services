import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, AppAbility } from '../ability.factory';
import { CHECK_ABILITY } from '../decorators/casl.decorator';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const abilityHandlers =
      this.reflector.getAllAndOverride<
        (ability: AppAbility) => boolean | undefined
      >(CHECK_ABILITY, [context.getHandler(), context.getClass()]) || [];

    if (!Array.isArray(abilityHandlers)) {
      throw new ForbiddenException('Invalid ability handlers configuration');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const ability = this.abilityFactory.defineAbilitiesFor(user);

    const isAllowed = abilityHandlers.every((handler) => handler(ability));

    if (!isAllowed) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
