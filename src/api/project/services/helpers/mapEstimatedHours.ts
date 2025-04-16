import { Data } from '@strapi/strapi';

export function mapEstimates(
  estimates: Data.ContentType<'api::work-activity-estimative.work-activity-estimative'>[]
) {
  const estimateMap = new Map<string, number>();
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

  for (const estimate of latestEstimateMap.values()) {
    const profileId = estimate.work_profile.documentId;
    const hours = estimate.adjustedEstimate ?? estimate.estimatedHours;
    estimateMap.set(profileId, (estimateMap.get(profileId) ?? 0) + hours);
  }

  return estimateMap;
}
