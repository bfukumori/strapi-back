/**
 * project service
 */

import { factories } from '@strapi/strapi';

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
  }: GetProjectSummaryParams) {},

  async getProjectProgress({
    projectId,
    sectionId,
    weekEnd,
    weekStart,
  }: GetProjectSummaryParams) {},
});
