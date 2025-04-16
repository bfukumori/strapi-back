import { DeadlineStatus } from '../../../../constants/enums';

export function getDeadlineStatus(predictedEndDate: string, deadline: string) {
  const predictedEnd = new Date(predictedEndDate);
  const deadlineDate = new Date(deadline);

  if (predictedEnd < deadlineDate) {
    return DeadlineStatus.AHEAD_TIME;
  } else if (predictedEnd > deadlineDate) {
    return DeadlineStatus.DELAYED;
  } else {
    return DeadlineStatus.ON_TIME;
  }
}
