/**
 * project service
 */

import { factories } from '@strapi/strapi';
import { mapExecutedHours } from './helpers/mapExecutedHours';
import { mapEstimates } from './helpers/mapEstimatedHours';
import { mapAllocations } from './helpers/mapAllocations';
import { summaryBuilder } from './helpers/summaryBuilder';
import { mapReadyToStart } from './helpers/mapReadyToStart';
import { calculateBusinessDays } from '../../../utils/calculateBusinessDays';
import { formatPercentage } from '../../../utils/formatPercentage';
import { getDeadlineStatus } from './helpers/getDeadlineStatus';
import { getTotalAdjustedEstimate } from './helpers/getTotalAdjustedEstimate';

type GetProjectSummaryParams = {
  projectId: string;
  sectionId: string;
  weekStart: string;
  weekEnd: string;
};

export default factories.createCoreService('api::project.project', {
  async getProjectSummary({
    projectId,
    sectionId,
    weekEnd,
    weekStart,
  }: GetProjectSummaryParams) {
    const date: { $gte?: string; $lte?: string } = {};
    if (weekStart) date.$gte = weekStart;
    if (weekEnd) date.$lte = weekEnd;

    const registerFilters = {
      ...(projectId && {
        project: { documentId: projectId },
      }),
      ...(sectionId && {
        project_section: { documentId: sectionId },
      }),
      ...(Object.keys(date).length > 0 && { date }),
    };

    const estimateFilters = {
      work_activity: {
        ...(projectId && {
          project: { documentId: projectId },
        }),
        ...(sectionId && {
          project_section: { documentId: sectionId },
        }),
      },
    };

    const allocationFilters = {
      ...(projectId && {
        project: { documentId: projectId },
      }),
      ...(sectionId && {
        project_section: { documentId: sectionId },
      }),
    };

    const [registers, estimates, allocations] = await Promise.all([
      strapi.documents('api::register-hour.register-hour').findMany({
        filters: registerFilters,
        populate: { work_profile: true, wefiter: true, work_activity: true },
      }),
      strapi
        .documents('api::work-activity-estimative.work-activity-estimative')
        .findMany({
          filters: estimateFilters,
          populate: {
            work_profile: true,
            work_activity: {
              populate: { activity_status: true },
            },
          },
        }),
      strapi.documents('api::allocation.allocation').findMany({
        filters: allocationFilters,
        populate: { work_profile: true, wefiter: true },
      }),
    ]);

    const executedMap = mapExecutedHours(registers);
    const estimateMap = mapEstimates(estimates);
    const allocationMap = mapAllocations(allocations);
    const readyToStartMap = mapReadyToStart(registers, estimates);

    return summaryBuilder({
      estimateMap,
      allocationMap,
      readyToStartMap,
      executedMap,
      allocations,
      estimates,
    });
  },

  async getProjectProgress({
    projectId,
    sectionId,
    weekEnd,
    weekStart,
  }: GetProjectSummaryParams) {
    // 1. Buscar estimativas ajustadas e iniciais
    const estimates = await strapi
      .documents('api::work-activity-estimative.work-activity-estimative')
      .findMany({
        filters: {
          work_activity: {
            project: {
              documentId: projectId,
            },
            ...(sectionId
              ? {
                  project_section: {
                    documentId: sectionId,
                  },
                }
              : {}),
          },
        },
        fields: ['adjustedEstimate', 'estimatedHours'],
        populate: ['work_activity', 'work_profile'],
      });

    const totalAdjustedEstimate = getTotalAdjustedEstimate(estimates);

    const totalInitialEstimate = estimates.reduce(
      (sum, est) => sum + (est.estimatedHours || 0),
      0
    );

    // 2. Buscar horas executadas
    const executed = await strapi
      .documents('api::register-hour.register-hour')
      .findMany({
        filters: {
          project: {
            documentId: projectId,
          },
          ...(sectionId
            ? {
                project_section: {
                  documentId: sectionId,
                },
              }
            : {}),
        },
        fields: ['executedHours'],
      });

    const totalExecuted = executed.reduce(
      (sum, r) => sum + (r.executedHours || 0),
      0
    );

    // 3. Calcular horas restantes para conclusão
    const totalRemainingEstimate = totalAdjustedEstimate - totalExecuted;

    // 4. Buscar alocações
    const allocations = await strapi
      .documents('api::allocation.allocation')
      .findMany({
        filters: {
          project: {
            documentId: projectId,
          },
          ...(sectionId
            ? {
                project_section: {
                  documentId: sectionId,
                },
              }
            : {}),
        },
        fields: ['hoursPerDay'],
      });

    // 5. Buscar feriados
    const holidayList = ['2025-04-17'];

    // 6. Capacidade total por dia
    const totalDailyCapacity = allocations.reduce(
      (sum, a) => sum + (a.hoursPerDay || 0),
      0
    );

    // 7. Calcular data prevista
    const daysNeeded =
      totalDailyCapacity > 0
        ? Math.ceil(totalRemainingEstimate / totalDailyCapacity)
        : null;
    const predictedEndDate = daysNeeded
      ? calculateBusinessDays(
          new Date().toISOString().split('T')[0],
          daysNeeded,
          holidayList
        )
      : null;

    // 8. Buscar deadline
    const project = await strapi.documents('api::project.project').findOne({
      documentId: projectId,
      fields: ['dueDate'],
    });

    const deadline = project?.dueDate ?? null;

    // 9. Calcular desvio
    const deviation = totalInitialEstimate - totalAdjustedEstimate;

    // 10. Calcular % executado
    const totalEstimateReal = totalAdjustedEstimate;
    const rawExecutedPercentage =
      totalEstimateReal > 0 ? totalExecuted / totalEstimateReal : 0;

    // 11. Verificar o status do deadline
    const deadlineStatus = getDeadlineStatus(
      predictedEndDate,
      deadline.toLocaleString()
    );

    return {
      totalInitialEstimate,
      totalAdjustedEstimate,
      totalExecuted,
      totalRemainingEstimate,
      rawExecutedPercentage,
      executedPercentage: formatPercentage(rawExecutedPercentage),
      predictedEndDate,
      deadline,
      deadlineStatus,
      deviation,
    };
  },
});
