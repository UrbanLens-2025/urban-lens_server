import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsBeforeToday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeToday',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _: ValidationArguments) {
          if (!value) return false;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const inputDate = new Date(value);
          const today = new Date();
          // Normalize to midnight so “same day” counts as today, not before
          today.setHours(0, 0, 0, 0);
          return inputDate < today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date before today`;
        },
      },
    });
  };
}
