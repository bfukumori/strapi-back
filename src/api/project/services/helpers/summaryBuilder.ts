import { Data } from '@strapi/strapi';
import { formatPercentage } from '../../../../utils/formatPercentage';
import { ExecutedHoursMap } from './mapExecutedHours';

type SummaryBuilderProps = {
  executedMap: Map<string, ExecutedHoursMap>;
  estimateMap: Map<string, number>;
  allocationMap: Map<string, Map<string, number>>;
  readyToStartMap: Map<string, Map<string, number>>;
  allocations: Data.ContentType<'api::allocation.allocation'>[];
  estimates: Data.ContentType<'api::work-activity-estimative.work-activity-estimative'>[];
};

export function summaryBuilder({
  allocationMap,
  estimateMap,
  executedMap,
  readyToStartMap,
  allocations,
  estimates,
}: SummaryBuilderProps) {
  const allProfileIds = new Set([
    ...executedMap.keys(),
    ...estimateMap.keys(),
    ...allocationMap.keys(),
  ]);

  const result = [];

  const totalProjectEstimatedHours = Array.from(estimateMap.values()).reduce(
    (acc, hours) => acc + hours,
    0
  );

  for (const profileId of allProfileIds) {
    const executedData = executedMap.get(profileId);
    const estimate = estimateMap.get(profileId) ?? 0;
    const wefiterAllocMap = allocationMap.get(profileId) ?? new Map();
    const wefiterReadyMap = readyToStartMap.get(profileId) ?? new Map();

    const workProfile =
      allocations.find((a) => a.work_profile?.documentId === profileId)
        ?.work_profile ??
      estimates.find((e) => e.work_profile?.documentId === profileId)
        ?.work_profile;

    const profileName = workProfile?.name ?? 'Desconhecido';
    const profileBgColor = workProfile?.bgColor ?? '#FFFFFF';
    const profileTextColor = workProfile?.textColor ?? '#000000';

    const wefiters = Array.from(wefiterAllocMap.entries()).map(
      ([wefiterId, capacity]) => {
        const executed = executedData?.wefiters.get(wefiterId) ?? 0;
        const allocation = allocations.find(
          (a) =>
            a.work_profile?.documentId === profileId &&
            a.wefiter?.documentId === wefiterId
        );
        const percentAllocatedRaw = capacity > 0 ? executed / capacity : 0;
        const name = allocation?.wefiter?.name ?? 'Desconhecido';
        const readyToStartHours = wefiterReadyMap.get(wefiterId) ?? 0;

        return {
          id: wefiterId,
          name,
          executed,
          capacity,
          readyToStartHours,
          percentAllocatedRaw,
          percentAllocated: formatPercentage(percentAllocatedRaw),
        };
      }
    );

    const totalExecuted = executedData?.executed ?? 0;
    const percentComplete = estimate > 0 ? totalExecuted / estimate : 0;
    const reaminingHoursToComplete = estimate - totalExecuted;
    const totalCapacity = Array.from(wefiterAllocMap.values()).reduce(
      (acc, capacity) => acc + capacity,
      0
    );
    const percentAllocated =
      totalCapacity > 0 ? totalExecuted / totalCapacity : 0;

    const proportionalWidth =
      totalProjectEstimatedHours > 0
        ? estimate / totalProjectEstimatedHours
        : 0;

    const profileRawPercentComplete =
      estimate > 0 ? Math.min(totalExecuted / estimate, 1) : 0;

    const totalReadyToStartHours = Array.from(wefiterReadyMap.values()).reduce(
      (acc, hours) => acc + hours,
      0
    );

    result.push({
      id: profileId,
      name: profileName,
      bgColor: profileBgColor,
      textColor: profileTextColor,
      estimatedHours: estimate,
      executedHours: totalExecuted,
      reaminingHoursToComplete,
      rawPercentComplete: percentComplete,
      percentComplete: formatPercentage(percentComplete),
      totalCapacity,
      rawPercentedAllocated: percentAllocated,
      percentAllocated: formatPercentage(percentAllocated),
      proportionalWidth,
      rawProfilePercentComplete: profileRawPercentComplete,
      profilePercentComplete: formatPercentage(profileRawPercentComplete),
      totalReadyToStartHours,
      wefiters,
    });
  }

  return result;
}
