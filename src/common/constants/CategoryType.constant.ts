/**
 * Category Type - Defines which entity type this category applies to
 */
export enum CategoryType {
  USER = 'USER', // For user preference categories (onboarding, profile)
  LOCATION = 'LOCATION', // For location categorization
  EVENT = 'EVENT', // For event categorization
  ALL = 'ALL', // Universal - applies to all entities
}
