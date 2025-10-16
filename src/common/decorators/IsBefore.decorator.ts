import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator';

export class IsBeforeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
    const relatedPropertyName = args?.constraints?.[0] as unknown as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const relatedValue = (args?.object as any)[relatedPropertyName] as Date;

    if (!value || !relatedValue) {
      return true; // skip validation if either value is not provided
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const valueDate = new Date(value);
    const relatedDate = new Date(relatedValue);

    return valueDate.getTime() < relatedDate.getTime();
  }

  defaultMessage?(args?: ValidationArguments): string {
    const relatedPropertyName = args?.constraints?.[0] as unknown as string;
    return `${args?.property} must be before ${relatedPropertyName}`;
  }
}

export function IsBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBeforeConstraint,
    });
  };
}
