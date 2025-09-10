export const DAY = 24 * 60 * 60 * 1000;
export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY);
}
export function minutesUntil(target: Date) {
  return Math.round((target.getTime() - Date.now()) / (60 * 1000));
}
