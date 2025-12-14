import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { LeaderboardPeriodType } from '@/modules/gamification/domain/LeaderboardSnapshot.entity';

/**
 * Validates periodValue format based on periodType
 * - weekly: YYYY-WW (e.g., 2025-W12)
 * - monthly: YYYY-MM (e.g., 2025-12)
 * - yearly: YYYY (e.g., 2025)
 * - seasonal: YYYY-season (e.g., 2025-spring)
 */
export function IsValidPeriodValue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPeriodValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || typeof value !== 'string') {
            return true; // Let @IsOptional handle empty values
          }

          const obj = args.object as { periodType?: LeaderboardPeriodType };
          const periodType = obj.periodType;

          if (!periodType) {
            return true; // Let @IsEnum handle periodType validation
          }

          switch (periodType) {
            case LeaderboardPeriodType.WEEKLY:
              // Format: YYYY-WW (e.g., 2025-W12)
              return /^\d{4}-W\d{1,2}$/.test(value);
            case LeaderboardPeriodType.MONTHLY:
              // Format: YYYY-MM (e.g., 2025-12)
              return /^\d{4}-\d{2}$/.test(value);
            case LeaderboardPeriodType.YEARLY:
              // Format: YYYY (e.g., 2025)
              return /^\d{4}$/.test(value);
            case LeaderboardPeriodType.SEASONAL:
              // Format: YYYY-season (e.g., 2025-spring)
              return /^\d{4}-(spring|summer|autumn|winter)$/.test(value);
            default:
              return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as { periodType?: LeaderboardPeriodType };
          const periodType = obj.periodType;

          switch (periodType) {
            case LeaderboardPeriodType.WEEKLY:
              return 'periodValue must be in format YYYY-WW (e.g., 2025-W12) for weekly period';
            case LeaderboardPeriodType.MONTHLY:
              return 'periodValue must be in format YYYY-MM (e.g., 2025-12) for monthly period';
            case LeaderboardPeriodType.YEARLY:
              return 'periodValue must be in format YYYY (e.g., 2025) for yearly period';
            case LeaderboardPeriodType.SEASONAL:
              return 'periodValue must be in format YYYY-season (e.g., 2025-spring) for seasonal period';
            default:
              return 'periodValue format is invalid for the specified periodType';
          }
        },
      },
    });
  };
}
