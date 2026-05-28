/// <reference types="vitest/globals" />

import { formatParticleLabel } from '../utils';

describe('formatParticleLabel', () => {
  it('replaces hyphens with spaces and capitalises the first letter', () => {
    expect(formatParticleLabel('epithelial-cells')).toBe('Epithelial cells');
    expect(formatParticleLabel('trichomonas-vaginalis')).toBe('Trichomonas vaginalis');
    expect(formatParticleLabel('mucus-threads')).toBe('Mucus threads');
    expect(formatParticleLabel('sperm-cells')).toBe('Sperm cells');
    expect(formatParticleLabel('urinary-casts')).toBe('Urinary casts');
  });

  it('capitalises single-word labels', () => {
    expect(formatParticleLabel('bacteria')).toBe('Bacteria');
    expect(formatParticleLabel('crystals')).toBe('Crystals');
    expect(formatParticleLabel('erythrocytes')).toBe('Erythrocytes');
    expect(formatParticleLabel('leukocytes')).toBe('Leukocytes');
    expect(formatParticleLabel('yeast')).toBe('Yeast');
  });
});
