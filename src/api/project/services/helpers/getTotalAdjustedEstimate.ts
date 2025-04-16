import { Data } from '@strapi/strapi';

export function getTotalAdjustedEstimate(
  estimates: Data.ContentType<'api::work-activity-estimative.work-activity-estimative'>[]
) {
  const latestEstimateMap = new Map<
    string,
    Data.ContentType<'api::work-activity-estimative.work-activity-estimative'>
  >();

  for (const estimate of estimates) {
    const key = `${estimate.work_activity.documentId}_${estimate.work_profile.documentId}`;
    const existing = latestEstimateMap.get(key);

    const newDate = estimate.dateOfAdjustment ?? estimate.createdAt;
    const existingDate = existing?.dateOfAdjustment ?? existing?.createdAt;

    if (!existing || new Date(newDate) > new Date(existingDate)) {
      latestEstimateMap.set(key, estimate);
    }
  }

  const total = Array.from(latestEstimateMap.values()).reduce(
    (sum, estimate) => {
      return sum + (estimate.adjustedEstimate ?? estimate.estimatedHours ?? 0);
    },
    0
  );

  return total;
}
