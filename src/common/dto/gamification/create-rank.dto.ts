import { RankName } from '@/modules/gamification/domain/Rank.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// Custom validator to check maxPoints > minPoints
function IsGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            typeof value === 'number' &&
            typeof relatedValue === 'number' &&
            value > relatedValue
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must be greater than ${relatedPropertyName}`;
        },
      },
    });
  };
}

export class CreateRankDto {
  @ApiProperty({ example: RankName.NEW_EXPLORER, description: 'Rank name' })
  @IsNotEmpty()
  @IsEnum(RankName)
  name: RankName;

  @ApiProperty({ example: 0, description: 'Minimum points required' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  minPoints: number;

  @ApiProperty({
    example: 999,
    description:
      'Maximum points for this rank (must be greater than minPoints)',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @IsGreaterThan('minPoints', {
    message: 'maxPoints must be greater than minPoints',
  })
  maxPoints: number;

  @ApiProperty({
    example: 'https://www.google.com/favicon.ico',
    description: 'Rank icon URL',
  })
  @IsNotEmpty()
  @IsString()
  icon: string;
}
