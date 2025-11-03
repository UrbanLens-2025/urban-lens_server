import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

@ValidatorConstraint({ name: 'TimeIsBefore', async: false })
export class TimeIsBeforeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
    const relatedPropertyName = args?.constraints?.[0] as unknown as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const relatedValue = (args?.object as any)[relatedPropertyName] as string;

    if (!value || !relatedValue) {
      return true; // skip validation if either value is not provided
    }

    dayjs.extend(customParseFormat);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const valueTime = dayjs(value, 'HH:mm');
    const relatedDate = dayjs(relatedValue, 'HH:mm');

    return valueTime.isBefore(relatedDate);
  }

  defaultMessage?(args?: ValidationArguments): string {
    const relatedPropertyName = args?.constraints?.[0] as unknown as string;
    return `${args?.property} must be before ${relatedPropertyName}`;
  }
}

export function TimeIsBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: TimeIsBeforeConstraint,
    });
  };
}
