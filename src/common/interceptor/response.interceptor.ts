import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SuccessResponseDto } from '@/common/dto/SuccessResponse.dto';

@Injectable()
export class ResponseInterceptorConfig<T>
  implements NestInterceptor<T, SuccessResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ):
    | Observable<SuccessResponseDto<T>>
    | Promise<Observable<SuccessResponseDto<T>>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: `Request successful.${data == null ? ' No content returned.' : ''}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        statusCode: context.switchToHttp().getResponse()['statusCode'] || 200,
        data,
      })),
    );
  }
}
