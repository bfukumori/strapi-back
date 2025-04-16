export function formatPercentage(value: number): string {
  return Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(value);
}
