/**
 * project controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::project.project', {
  async summary(ctx) {
    const { id: projectId } = ctx.params;
    const { scopeId, moduleId, featureId, weekStart, weekEnd } = ctx.query;

    const response = strapi
      .service('api::project.project')
      .getProjectSummary({
        projectId,
        scopeId,
        moduleId,
        featureId,
        weekStart,
        weekEnd,
      });

    return response;
  },

  async progress(ctx) {
    const { id: projectId } = ctx.params;
    const { scopeId, moduleId, featureId, weekStart, weekEnd } = ctx.query;

    const response = strapi
      .service('api::project.project')
      .getProjectProgress({
        projectId,
        scopeId,
        moduleId,
        featureId,
        weekStart,
        weekEnd,
      });

    return response;
  },
});
