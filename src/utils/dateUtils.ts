/**
 * Utility functions for date handling and validation
 */

/**
 * Fixes invalid dates by ensuring they fall within valid month boundaries
 * @param year - The year
 * @param month - The month (1-12)
 * @param day - The day (1-31)
 * @returns A valid date string in YYYY-MM-DD format
 */
export function fixInvalidDate(year: number, month: number, day: number): string {
  // Get the last day of the month
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  
  // If the day is invalid for the month, use the last day of the month
  const validDay = Math.min(day, lastDayOfMonth);
  
  return `${year}-${month.toString().padStart(2, '0')}-${validDay.toString().padStart(2, '0')}`;
}

/**
 * Gets the first and last day of a month, ensuring valid dates
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Object with firstDay and lastDay in YYYY-MM-DD format
 */
export function getMonthBoundaries(year: number, month: number): { firstDay: string; lastDay: string } {
  const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = fixInvalidDate(year, month, 31);
  
  return { firstDay, lastDay };
}

/**
 * Gets the first and last day of a quarter, ensuring valid dates
 * @param year - The year
 * @param quarter - The quarter (1-4)
 * @returns Object with firstDay and lastDay in YYYY-MM-DD format
 */
export function getQuarterBoundaries(year: number, quarter: number): { firstDay: string; lastDay: string } {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;
  
  const firstDay = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
  const lastDay = fixInvalidDate(year, endMonth, 31);
  
  return { firstDay, lastDay };
}

/**
 * Validates if a date string is valid
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is valid, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Formats a date for display
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!isValidDate(dateString)) return 'Date invalide';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
