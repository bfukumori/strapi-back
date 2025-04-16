import { Data } from '@strapi/strapi';

export function mapAllocations(
  allocations: Data.ContentType<'api::allocation.allocation'>[]
) {
  const allocationMap = new Map<string, Map<string, number>>();

  for (const allocation of allocations) {
    const profileId = allocation.work_profile.documentId;
    const wefiterId = allocation.wefiter.documentId;

    const current = allocationMap.get(profileId) ?? new Map<string, number>();
    const alreadyAllocated = current.has(wefiterId);

    if (!alreadyAllocated) {
      const weeklyCapacity =
        allocation.hoursPerDay * allocation.workDaysPerWeek;
      current.set(wefiterId, weeklyCapacity);
      allocationMap.set(profileId, current);
    }
  }

  return allocationMap;
}
