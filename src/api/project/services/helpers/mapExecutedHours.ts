import { Data } from '@strapi/strapi';

export type ExecutedHoursMap = {
  executed: number;
  wefiters: Map<string, number>;
};

export function mapExecutedHours(
  registers: Data.ContentType<'api::register-hour.register-hour'>[]
) {
  const executedHoursMap = new Map<string, ExecutedHoursMap>();

  for (const { work_profile, wefiter, executedHours } of registers) {
    const profileId = work_profile.documentId;
    const wefiterId = wefiter.documentId;

    const current = executedHoursMap.get(profileId) ?? {
      executed: 0,
      wefiters: new Map(),
    };

    current.executed += executedHours;
    current.wefiters.set(
      wefiterId,
      (current.wefiters.get(wefiterId) ?? 0) + executedHours
    );
    executedHoursMap.set(profileId, current);
  }

  return executedHoursMap;
}
