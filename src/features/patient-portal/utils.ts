export function formatParticleLabel(label: string): string {
  return label.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
}
