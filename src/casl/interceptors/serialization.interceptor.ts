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

    return next.handle().pipe(
      map((data) => {
        if (!user) {
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

      for (const [key, value] of Object.entries(data)) {
        // Check if user can read this field
        if (ability.can(Action.Read, data, key)) {
          if (value && typeof value === 'object') {
            sanitizedData[key] = this.sanitizeData(value, ability);
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
