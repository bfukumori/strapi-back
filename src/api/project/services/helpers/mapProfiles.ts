import { Data } from '@strapi/strapi';
import { TaskStatus } from '../../../../constants/enums';

type ProfileMap = {
  name: string;
  bgColor: string;
  textColor: string;
  wefiters: Set<string>;
  executedHours: number;
  remainingHours: number;
  readyToStart: number;
};

export function mapProfiles(
  projects: Data.ContentType<'api::project.project'>,
  weekStart?: string,
  weekEnd?: string
) {
  const profilesMap = new Map<string, ProfileMap>();
  const totalUniqueWefitersSet = new Set<string>();

  const hasPeriod = weekStart && weekEnd;
  const startDate = hasPeriod ? new Date(weekStart) : null;
  const endDate = hasPeriod ? new Date(weekEnd) : null;

  for (const scope of projects.project_scopes) {
    for (const mod of scope.project_modules) {
      for (const feature of mod.features) {
        for (const task of feature.tasks) {
          const profile = task.task_profile;

          if (!profile) continue;

          const profileName = profile.name;

          if (!profilesMap.has(profileName)) {
            profilesMap.set(profileName, {
              name: profileName,
              bgColor: profile.bgColor,
              textColor: profile.textColor,
              executedHours: 0,
              remainingHours: 0,
              readyToStart: 0,
              wefiters: new Set<string>(),
            });
          }

          const profileData = profilesMap.get(profileName);

          for (const task of profile.tasks) {
            for (const sub of task.sub_tasks) {
              let subtaskInPeriod = false;

              for (const taskHour of sub.task_hours) {
                const hours = taskHour.hours;
                const hourDate = new Date(taskHour.date);

                const isInPeriod =
                  !hasPeriod ||
                  (hourDate >= startDate! && hourDate <= endDate!);

                if (isInPeriod) {
                  const wefiterName = taskHour.wefiter?.name;
                  if (wefiterName) {
                    profileData.wefiters.add(wefiterName);
                    totalUniqueWefitersSet.add(wefiterName);
                  }

                  profileData.executedHours += hours;
                  subtaskInPeriod = true;
                }
              }

              const shouldCountRemaining = !hasPeriod || subtaskInPeriod;
              if (shouldCountRemaining) {
                profileData.remainingHours += sub.remainingHours || 0;
              }

              const isToday =
                !hasPeriod ||
                new Date().toISOString().split('T')[0] ===
                  endDate?.toISOString().split('T')[0];

              if (
                sub.task_status.label === TaskStatus.READY_TO_START &&
                isToday &&
                sub.task_hours.length === 0
              ) {
                profileData.readyToStart += sub.initialEstimateHours || 0;
              }
            }
          }
        }
      }
    }
  }

  return {
    profilesMap,
    totalUniqueWefiters: totalUniqueWefitersSet.size,
  };
}
