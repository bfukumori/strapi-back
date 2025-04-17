import { Data } from '@strapi/strapi';
import { calculateBusinessDays } from '../../../../utils/calculateBusinessDays';
import { getDeadlineStatus } from '../../../../utils/getDeadlineStatus';

export function calculateEndDate(
  project: Data.ContentType<'api::project.project'>,
  totalRemaining: number
) {
  const holydays = []; // TODO: Criar função para buscar os feriados

  const today = new Date();
  const HOURS_PER_DAY = 8;
  const predictedEndDate = calculateBusinessDays(
    today,
    totalRemaining,
    HOURS_PER_DAY,
    holydays
  );

  const dueDate = project.dueDate.toLocaleString();
  const deadlineStatus = getDeadlineStatus(dueDate, predictedEndDate);

  return {
    predictedEndDate,
    deadlineStatus,
    dueDate,
  };
}
