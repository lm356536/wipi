import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { responseLogger, requestLogger } from '../logger';

interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const { body } = request;
        const statusCode = response.statusCode;
        const url = request.originalUrl;
        const res = {
          statusCode,
          msg: null,
          success: true,
          data,
        };
        responseLogger.info(url, res);
        requestLogger.info(url, body);
        return res;
      })
    );
  }
}
