import { Data } from '@strapi/strapi';
import { formatPercentage } from '../../../../utils/formatPercentage';

export function calculateProgress(
  project: Data.ContentType<'api::project.project'>,
  weekStart?: string,
  weekEnd?: string
) {
  let totalEstimated = 0;
  let totalRemaining = 0;
  let totalExecuted = 0;

  let totalEstimatedPeriod = 0;
  let totalRemainingPeriod = 0;
  let totalExecutedPeriod = 0;

  const hasPeriod = weekStart && weekEnd;
  const startDate = hasPeriod ? new Date(weekStart) : null;
  const endDate = hasPeriod ? new Date(weekEnd) : null;

  for (const scope of project.project_scopes) {
    for (const _module of scope.project_modules) {
      for (const feature of _module.features) {
        for (const task of feature.tasks) {
          if (task.sub_tasks.length === 0) {
            totalEstimated += task.initalEstimatedHours;
            totalRemaining += task.initalEstimatedHours;

            if (hasPeriod) {
              totalEstimatedPeriod += task.initalEstimatedHours;
              totalRemainingPeriod += task.initalEstimatedHours;
            }
          }

          for (const subtask of task.sub_tasks) {
            totalEstimated += subtask.initialEstimateHours;
            totalRemaining += subtask.remainingHours;

            let subtaskInPeriod = false;

            for (const taskHour of subtask.task_hours) {
              const hour = taskHour.hours;
              const hourDate = new Date(taskHour.date);

              totalExecuted += hour;

              if (hasPeriod && hourDate >= startDate! && hourDate <= endDate!) {
                totalExecutedPeriod += hour;
                subtaskInPeriod = true;
              }
            }

            if (hasPeriod && subtaskInPeriod) {
              totalEstimatedPeriod += subtask.initialEstimateHours;
              totalRemainingPeriod += subtask.remainingHours;
            }
          }
        }
      }
    }
  }

  const deviationOverall = totalEstimated - (totalRemaining + totalExecuted);
  const deviationPeriod =
    totalEstimatedPeriod - (totalRemainingPeriod + totalExecutedPeriod);

  const progressOverall = totalExecuted / (totalRemaining + totalExecuted);
  const progressPeriod =
    totalExecutedPeriod / (totalRemainingPeriod + totalExecutedPeriod);

  const formattedProgressOverall = formatPercentage(progressOverall);
  const formattedProgressPeriod = formatPercentage(progressPeriod);

  const progress = hasPeriod ? progressPeriod : progressOverall;
  const formattedProgress = hasPeriod
    ? formattedProgressPeriod
    : formattedProgressOverall;

  const deviation = hasPeriod ? deviationPeriod : deviationOverall;

  return {
    totalEstimated: hasPeriod ? totalEstimatedPeriod : totalEstimated,
    totalExecuted: hasPeriod ? totalExecutedPeriod : totalExecuted,
    totalRemaining: hasPeriod ? totalRemainingPeriod : totalRemaining,
    deviation,
    progress,
    formattedProgress: isNaN(progress) ? '0%' : formattedProgress,
    totalRemainingOverall: totalRemaining,
  };
}
