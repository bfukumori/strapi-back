/**
 * project service
 */

import { factories } from '@strapi/strapi';
import { calculateProgress } from './helpers/calculateProgress';
import { calculateEndDate } from './helpers/calculateEndDate';
import { getBaseFilters } from './helpers/getBaseFilters';
import { formatPercentage } from '../../../utils/formatPercentage';
import { mapProfiles } from './helpers/mapProfiles';

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
  }: GetProjectStatsParams) {
    const { featureFilter, moduleFilter, scopedFilter } = getBaseFilters({
      featureId,
      moduleId,
      scopeId,
    });

    const projects = await strapi.documents('api::project.project').findOne({
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
                      fields: ['id', 'initialEstimatedHours'],
                      populate: {
                        task_profile: {
                          populate: {
                            tasks: {
                              fields: ['initialEstimatedHours'],
                              populate: {
                                sub_tasks: {
                                  fields: [
                                    'initialEstimateHours',
                                    'remainingHours',
                                  ],
                                  populate: {
                                    task_status: {
                                      fields: ['label'],
                                    },
                                    task_hours: {
                                      fields: ['hours', 'date'],
                                      populate: {
                                        wefiter: {
                                          fields: ['name'],
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          fields: ['name', 'bgColor', 'textColor'],
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

    const { profilesMap, totalUniqueWefiters } = mapProfiles(
      projects,
      weekStart,
      weekEnd
    );

    const result = Array.from(profilesMap.values()).map((profile) => {
      const totalHours = profile.executedHours + profile.remainingHours;
      const percentageToConclude =
        totalHours > 0 ? profile.executedHours / totalHours : 0;

      return {
        profile: profile.name,
        bgColor: profile.bgColor,
        textColor: profile.textColor,
        wefiters: profile.wefiters.size,
        executedHours: profile.executedHours,
        remainingHours: profile.remainingHours,
        readyToStart: profile.readyToStart,
        rawPercentageToConclude: percentageToConclude,
        formattedPercentageToConclude: formatPercentage(percentageToConclude),
      };
    });

    return {
      profile: result,
      totalUniqueWefiters,
    };
  },

  async getProjectProgress({
    projectId,
    scopeId,
    moduleId,
    featureId,
    weekEnd,
    weekStart,
  }: GetProjectStatsParams) {
    const { featureFilter, moduleFilter, scopedFilter } = getBaseFilters({
      featureId,
      moduleId,
      scopeId,
    });

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
                      fields: ['id', 'initialEstimatedHours'],
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
