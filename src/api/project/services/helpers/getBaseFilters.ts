type GetBaseFiltersParams = {
  scopeId: string;
  moduleId: string;
  featureId: string;
};

export function getBaseFilters({
  featureId,
  moduleId,
  scopeId,
}: GetBaseFiltersParams) {
  const scopedFilter = { filters: {} };
  const moduleFilter = { filters: {} };
  const featureFilter = { filters: {} };

  if (scopeId) {
    scopedFilter.filters = { documentId: scopeId };
  }
  if (moduleId) {
    moduleFilter.filters = { documentId: moduleId };
  }
  if (featureId) {
    featureFilter.filters = { documentId: featureId };
  }

  return {
    scopedFilter,
    moduleFilter,
    featureFilter,
  };
}
