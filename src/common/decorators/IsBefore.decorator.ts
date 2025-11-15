import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsBefore', async: false })
export class IsBeforeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
    const relatedPropertyName = args?.constraints?.[0] as unknown as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const relatedValue = (args?.object as any)[relatedPropertyName] as Date;

    if (
      value === null ||
      value === undefined ||
      relatedValue === null ||
      relatedValue === undefined
    ) {
      return true; // skip validation if either value is not provided
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const valueDate = new Date(value);
    const relatedDate = new Date(relatedValue);

    // Check if dates are valid
    if (isNaN(valueDate.getTime()) || isNaN(relatedDate.getTime())) {
      return false; // invalid dates should fail validation
    }

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
