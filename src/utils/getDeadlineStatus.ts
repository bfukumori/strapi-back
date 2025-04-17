import { DeadlineStatus } from '../constants/enums';

export function getDeadlineStatus(dueDate: string, predictedEndDate: string) {
  const dueDateObj = new Date(dueDate);
  const predictedEndDateObj = new Date(predictedEndDate);
  const today = new Date();
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const isOverdue = todayUTC > dueDateObj;
  const isDelayed = predictedEndDateObj > dueDateObj;
  const isAheadOfSchedule = predictedEndDateObj < dueDateObj;

  if (isOverdue) {
    return DeadlineStatus.OVERDUE;
  } else if (isDelayed) {
    return DeadlineStatus.DELAYED;
  } else if (isAheadOfSchedule) {
    return DeadlineStatus.AHEAD_OF_SCHEDULE;
  } else {
    return DeadlineStatus.ON_TIME;
  }
}
