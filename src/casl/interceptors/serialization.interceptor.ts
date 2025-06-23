import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaslAbilityFactory } from '../ability.factory';
import { Action } from '../ability.factory';

@Injectable()
export class CaslSerializationInterceptor implements NestInterceptor {
  constructor(private readonly abilityFactory: CaslAbilityFactory) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    const ROLE_ID_ADMIN = 1;
    const isAdmin = user.role.id === ROLE_ID_ADMIN;

    request.isAdmin = isAdmin;

    return next.handle().pipe(
      map((data) => {
        if (isAdmin) {
          return data;
        }

        const ability = this.abilityFactory.defineAbilitiesFor(user);
        return this.sanitizeData(data, ability);
      }),
    );
  }

  private sanitizeData(data: any, ability: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item, ability));
    }

    if (data && typeof data === 'object') {
      const sanitizedData: any = {};

      const subjectType = data.constructor.name;

      for (const [key, value] of Object.entries(data)) {
        if (ability.can(Action.Read, subjectType, key)) {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitizedData[key] = this.sanitizeData(value, ability);
          } else if (Array.isArray(value)) {
            sanitizedData[key] = value.map((item) =>
              this.sanitizeData(item, ability),
            );
          } else {
            sanitizedData[key] = value;
          }
        }
      }

      return sanitizedData;
    }

    return data;
  }
}
