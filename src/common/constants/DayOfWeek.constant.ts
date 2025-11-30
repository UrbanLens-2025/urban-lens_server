export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export function numberToDayOfWeek(number: number): DayOfWeek {
  if (number === 0) {
    return DayOfWeek.SUNDAY;
  }
  if (number === 1) {
    return DayOfWeek.MONDAY;
  }
  if (number === 2) {
    return DayOfWeek.TUESDAY;
  }
  if (number === 3) {
    return DayOfWeek.WEDNESDAY;
  }
  if (number === 4) {
    return DayOfWeek.THURSDAY;
  }
  if (number === 5) {
    return DayOfWeek.FRIDAY;
  }
  if (number === 6) {
    return DayOfWeek.SATURDAY;
  }
  throw new Error(`Invalid day of week: ${number}`);
}
