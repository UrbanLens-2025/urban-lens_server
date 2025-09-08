export class SuccessResponseDto<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
