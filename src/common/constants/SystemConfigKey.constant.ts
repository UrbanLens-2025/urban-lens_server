export enum SystemConfigKey {
  LOCATION_BOOKING_SYSTEM_PAYOUT_PERCENTAGE = 'LOCATION_BOOKING_SYSTEM_PAYOUT_PERCENTAGE',
  EVENT_SYSTEM_PAYOUT_PERCENTAGE = 'EVENT_SYSTEM_PAYOUT_PERCENTAGE',

  LOCATION_BOOKING_FORCE_CANCELLATION_FINE_PERCENTAGE = 'LOCATION_BOOKING_FORCE_CANCELLATION_FINE_PERCENTAGE',
}

export type SystemConfigValue = {
  [SystemConfigKey.LOCATION_BOOKING_SYSTEM_PAYOUT_PERCENTAGE]: number;
  [SystemConfigKey.EVENT_SYSTEM_PAYOUT_PERCENTAGE]: number;
  [SystemConfigKey.LOCATION_BOOKING_FORCE_CANCELLATION_FINE_PERCENTAGE]: number;
};

export const DEFAULT_SYSTEM_CONFIG_VALUES: {
  [key in SystemConfigKey]: SystemConfigValue[key];
} = {
  [SystemConfigKey.LOCATION_BOOKING_SYSTEM_PAYOUT_PERCENTAGE]: 0.1,
  [SystemConfigKey.EVENT_SYSTEM_PAYOUT_PERCENTAGE]: 0.1,
  [SystemConfigKey.LOCATION_BOOKING_FORCE_CANCELLATION_FINE_PERCENTAGE]: 0.5,
};

export const parseSystemConfigValue = (
  key: SystemConfigKey,
  value: string,
): SystemConfigValue[keyof SystemConfigValue] => {
  switch (key) {
    case SystemConfigKey.LOCATION_BOOKING_SYSTEM_PAYOUT_PERCENTAGE: {
      const result = parseFloat(value);
      if (isNaN(result)) {
        return NaN;
      }
      if (result < 0 || result > 1) {
        return NaN;
      }
      return result;
    }
    case SystemConfigKey.EVENT_SYSTEM_PAYOUT_PERCENTAGE: {
      const result = parseFloat(value);
      if (isNaN(result)) {
        return NaN;
      }
      if (result < 0 || result > 1) {
        return NaN;
      }
      return result;
    }
    case SystemConfigKey.LOCATION_BOOKING_FORCE_CANCELLATION_FINE_PERCENTAGE: {
      const result = parseFloat(value);
      if (isNaN(result)) {
        return NaN;
      }
      if (result < 0 || result > 1) {
        return NaN;
      }
      return result;
    }
    default:
      throw new Error(`Invalid system config key: ${key as any}`);
  }
};
