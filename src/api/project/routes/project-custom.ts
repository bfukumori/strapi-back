export default {
  routes: [
    {
      method: 'GET',
      path: '/projects/:id/summary',
      handler: 'project.summary',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/projects/:id/progress',
      handler: 'project.progress',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
