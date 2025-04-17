export function calculateBusinessDays(
  startDate: Date | string,
  totalHours: number,
  hoursPerDay: number,
  holydays: string[]
) {
  const date = new Date(startDate);
  let remainingHours = totalHours;

  while (remainingHours > 0) {
    date.setDate(date.getDate() + 1);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holydays.includes(date.toISOString().split('T')[0]);

    if (!isWeekend && !isHoliday) {
      remainingHours -= hoursPerDay;
    }
  }

  return date.toISOString().split('T')[0];
}
