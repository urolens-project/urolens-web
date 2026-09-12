export function formatParticleLabel(label: string): string {
  // Backend labels are underscore-separated (e.g. "epithelial_cells"); also
  // handle hyphens in case that ever changes back, rather than assume one.
  return label.replace(/[-_]/g, ' ').replace(/^\w/, c => c.toUpperCase());
}
