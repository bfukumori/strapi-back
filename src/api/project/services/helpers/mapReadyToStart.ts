import { Data } from '@strapi/strapi';
import { mapActivityEstimates } from './mapActivityEstimates';

export function mapReadyToStart(
  registerHours: Data.ContentType<'api::register-hour.register-hour'>[],
  estimatives: Data.ContentType<'api::work-activity-estimative.work-activity-estimative'>[]
) {
  const readyToStartMap = new Map<string, Map<string, number>>();

  for (const rh of registerHours) {
    const workActivityId = rh.work_activity?.documentId;
    const wefiterId = rh.wefiter?.documentId;
    const roleProfileId = rh.work_profile?.documentId;

    if (!workActivityId || !wefiterId || !roleProfileId) continue;

    const estimates = mapActivityEstimates(estimatives).get(workActivityId);

    if (!estimates) continue;

    for (const {
      workProfileId: estimateProfileId,
      estimatedHours,
    } of estimates) {
      if (estimateProfileId === roleProfileId) {
        if (!readyToStartMap.has(roleProfileId)) {
          readyToStartMap.set(roleProfileId, new Map());
        }

        const profileMap = readyToStartMap.get(roleProfileId)!;
        const current = profileMap.get(wefiterId) ?? 0;
        profileMap.set(wefiterId, current + estimatedHours);
      }
    }
  }

  return readyToStartMap;
}
