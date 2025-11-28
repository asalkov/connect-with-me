import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor to standardize API responses
 * Eliminates manual response wrapping in controllers
 */
@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already wrapped or is a string message, return as-is
        if (typeof data === 'string' || data?.message || data?.statusCode) {
          return data;
        }

        // If data is null or undefined, return empty object
        if (data === null || data === undefined) {
          return {};
        }

        // Return data as-is (let controllers decide structure)
        return data;
      }),
    );
  }
}
