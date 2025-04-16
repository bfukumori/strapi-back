import { Data } from '@strapi/strapi';
import { ActivityStatus } from '../../../../constants/enums';

type ActivityEstimatesMap = { workProfileId: string; estimatedHours: number };

export function mapActivityEstimates(
  estimates: Data.ContentType<'api::work-activity-estimative.work-activity-estimative'>[]
) {
  const activityEstimatesMap = new Map<string, ActivityEstimatesMap[]>();

  for (const estimate of estimates) {
    const workActivity = estimate.work_activity;
    const statusLabel = workActivity?.activity_status?.label;
    const workActivityId = workActivity?.documentId;
    const workProfileId = estimate.work_profile?.documentId;
    const estimatedHours = estimate.estimatedHours ?? 0;

    if (
      workActivityId &&
      workProfileId &&
      statusLabel === ActivityStatus.READY_TO_START
    ) {
      if (!activityEstimatesMap.has(workActivityId)) {
        activityEstimatesMap.set(workActivityId, []);
      }

      activityEstimatesMap.get(workActivityId)!.push({
        workProfileId,
        estimatedHours,
      });
    }
  }

  return activityEstimatesMap;
}
