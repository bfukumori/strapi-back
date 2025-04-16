'use strict';

const {
  taskStatuses,
  taskProfiles,
  projectStatuses,
  projectScopes,
  stakeholders,
  wefiters,
} = require('../data/data.json');

async function seedData() {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up the data...');
      await importSeedData();
      console.log('Ready to go');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log(
      'Seed data has already been imported. We cannot reimport unless you clear your database first.'
    );
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: {
        type: 'public',
      },
    });

  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function createEntry({ model, entry }) {
  try {
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
      status: 'published',
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function importWefiters() {
  for (const wefiter of wefiters) {
    await createEntry({ model: 'wefiter', entry: wefiter });
  }
}
async function importTaskStatuses() {
  for (const status of taskStatuses) {
    await createEntry({ model: 'task-status', entry: status });
  }
}

async function importTaskProfiles() {
  for (const profile of taskProfiles) {
    await createEntry({ model: 'task-profile', entry: profile });
  }
}

async function importProjectStatuses() {
  for (const status of projectStatuses) {
    await createEntry({ model: 'project-status', entry: status });
  }
}

async function importProjectScopes() {
  for (const scope of projectScopes) {
    await createEntry({ model: 'project-scope', entry: scope });
  }
}

async function importStakeholders() {
  for (const stakeholder of stakeholders) {
    await createEntry({ model: 'stakeholder', entry: stakeholder });
  }
}

async function importSeedData() {
  await Promise.all([
    importWefiters(),
    importTaskProfiles(),
    importTaskStatuses(),
    importProjectStatuses(),
    importProjectScopes(),
    importStakeholders(),
    setPublicPermissions({
      feature: ['find', 'findOne'],
      'job-contract': ['find', 'findOne'],
      project: ['find', 'findOne'],
      'project-module': ['find', 'findOne'],
      'project-scope': ['find', 'findOne'],
      'project-status': ['find', 'findOne'],
      stakeholder: ['find', 'findOne'],
      'sub-task': ['find', 'findOne'],
      task: ['find', 'findOne'],
      'task-hour': ['find', 'findOne'],
      'task-profile': ['find', 'findOne'],
      'task-status': ['find', 'findOne'],
      wefiter: ['find', 'findOne'],
    }),
  ]);
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedData();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
