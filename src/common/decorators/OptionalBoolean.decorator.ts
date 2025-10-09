import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export function OptionalBoolean() {
  return function (target: any, propertyName: string) {
    IsOptional()(target, propertyName);
    Transform(({ value }) => {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'undefined' ||
        value === 'null'
      ) {
        return undefined;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return undefined;
    })(target, propertyName);
  };
}
