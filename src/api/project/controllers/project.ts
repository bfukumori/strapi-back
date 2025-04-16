/**
 * project controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::project.project', {
  async summary(ctx) {
    const { id: projectId } = ctx.params;
    const { sectionId, weekStart, weekEnd } = ctx.query;

    const response = strapi
      .service('api::project.project')
      .getProjectSummary({ projectId, sectionId, weekStart, weekEnd });

    return response;
  },

  async progress(ctx) {
    const { id: projectId } = ctx.params;
    const { sectionId, weekStart, weekEnd } = ctx.query;

    const response = strapi
      .service('api::project.project')
      .getProjectProgress({ projectId, sectionId, weekStart, weekEnd });

    return response;
  },
});
