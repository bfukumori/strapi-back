export function calculateBusinessDays(
  startDate: string,
  daysNeeded: number,
  holydays: string[]
) {
  let date = new Date(startDate);

  while (daysNeeded > 0) {
    date.setDate(date.getDate() + 1);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holydays.includes(date.toISOString().split('T')[0]);

    if (!isWeekend && !isHoliday) {
      daysNeeded--;
    }
  }

  return date.toISOString().split('T')[0];
}
