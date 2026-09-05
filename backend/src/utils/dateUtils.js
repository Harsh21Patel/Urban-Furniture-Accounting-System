/**
 * Utility functions for accounting date boundaries
 */

/**
 * Returns a Date set to the start of the specified day (00:00:00.000)
 */
export function startOfDay(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns a Date set to the start of the NEXT day (00:00:00.000)
 * Useful for strictly `< startOfNextDay` boundary conditions
 */
export function startOfNextDay(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Constructs a Prisma date filter for a date range (from, to)
 * Includes the entire 'to' day: date >= startOfDay(from) AND date < startOfNextDay(to)
 */
export function getDateRangeFilter(from, to) {
  const filter = {};
  if (from) {
    const s = startOfDay(from);
    if (s) filter.gte = s;
  }
  if (to) {
    const nextDay = startOfNextDay(to);
    if (nextDay) filter.lt = nextDay;
  }
  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Constructs a Prisma date filter for an "As of" date
 * Includes the entire 'asOf' day: date < startOfNextDay(asOf)
 */
export function getAsOfFilter(asOf) {
  if (!asOf) return undefined;
  const nextDay = startOfNextDay(asOf);
  return nextDay ? { lt: nextDay } : undefined;
}
