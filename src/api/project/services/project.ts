/**
 * project service
 */

import { factories } from '@strapi/strapi';
import { calculateProgress } from './helpers/calculateProgress';
import { calculateEndDate } from './helpers/calculateEndDate';

type GetProjectStatsParams = {
  projectId: string;
  scopeId: string;
  moduleId: string;
  featureId: string;
  weekStart: string;
  weekEnd: string;
};

export default factories.createCoreService('api::project.project', {
  async getProjectSummary({
    projectId,
    scopeId,
    moduleId,
    featureId,
    weekEnd,
    weekStart,
  }: GetProjectStatsParams) {},

  async getProjectProgress({
    projectId,
    scopeId,
    moduleId,
    featureId,
    weekEnd,
    weekStart,
  }: GetProjectStatsParams) {
    const scopedFilter = { filters: {} };
    const moduleFilter = { filters: {} };
    const featureFilter = { filters: {} };

    if (scopeId) {
      scopedFilter.filters = { documentId: scopeId };
    }
    if (moduleId) {
      moduleFilter.filters = { documentId: moduleId };
    }
    if (featureId) {
      featureFilter.filters = { documentId: featureId };
    }

    const project = await strapi.documents('api::project.project').findOne({
      documentId: projectId,
      fields: ['id', 'dueDate'],
      populate: {
        project_scopes: {
          ...scopedFilter,
          fields: ['id'],
          populate: {
            project_modules: {
              ...moduleFilter,
              fields: ['id'],
              populate: {
                features: {
                  ...featureFilter,
                  fields: ['id'],
                  populate: {
                    tasks: {
                      fields: ['id', 'initalEstimatedHours'],
                      populate: {
                        sub_tasks: {
                          fields: ['initialEstimateHours', 'remainingHours'],
                          populate: {
                            task_hours: {
                              fields: ['hours', 'date'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const {
      progress,
      deviation,
      formattedProgress,
      totalEstimated,
      totalExecuted,
      totalRemaining,
      totalRemainingOverall,
    } = calculateProgress(project, weekStart, weekEnd);

    const { deadlineStatus, dueDate, predictedEndDate } = calculateEndDate(
      project,
      totalRemainingOverall
    );

    return {
      totalEstimated,
      totalExecuted,
      totalRemaining,
      deviation,
      progress,
      formattedProgress,
      dueDate,
      predictedEndDate,
      deadlineStatus,
    };
  },
});
