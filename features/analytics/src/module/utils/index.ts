// eslint-disable-next-line no-restricted-imports
import snakeCase from 'lodash/snakeCase.js'

/**
 * Normalize property names to snake_case for internal storage.
 * Uses the same transformation logic as segment-metrics to ensure consistency
 * across the analytics pipeline.
 *
 * The regex handles letter-to-number boundaries (e.g., 'hasBackup2' -> 'has_backup_2')
 * to ensure complete normalization.
 * @param {string} property - Property name in any format (camelCase, snake_case, etc.)
 * @returns {string} Normalized property name in snake_case
 * @example
 * normalizePropertyName('hasBackup') // 'has_backup'
 * normalizePropertyName('has_backup') // 'has_backup'
 * normalizePropertyName('hasBackup2') // 'has_backup_2'
 * normalizePropertyName('totalBalanceUsd100') // 'total_balance_usd_100'
 */
export const normalizePropertyName = (property: string): string => {
  return snakeCase(property).replace(/([A-Za-z])(\d+)/gu, '$1_$2')
}
