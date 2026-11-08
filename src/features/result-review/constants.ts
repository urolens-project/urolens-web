// The canonical particle types the AI engine classifies, matching the
// backend's PARTICLE_LABELS (schemas/patient_portal.py) exactly — keep
// both lists in sync.
export const PARTICLE_LABELS = [
  'erythrocytes',
  'leukocytes',
  'epithelial_cells',
  'urinary_casts',
  'crystals',
  'mucus_threads',
  'bacteria',
  'yeast',
  'sperm_cells',
  'trichomonas_vaginalis',
] as const;

export const PARTICLE_LABEL_DISPLAY: Record<string, string> = {
  erythrocytes: 'Erythrocytes (RBC)',
  leukocytes: 'Leukocytes (WBC)',
  epithelial_cells: 'Epithelial Cells',
  urinary_casts: 'Urinary Casts',
  crystals: 'Crystals',
  mucus_threads: 'Mucus Threads',
  bacteria: 'Bacteria',
  yeast: 'Yeast',
  sperm_cells: 'Sperm Cells',
  trichomonas_vaginalis: 'Trichomonas vaginalis',
};

// Backend sends reviewer_role uppercase (matches the UserRole enum values
// in the DB, e.g. "SUPERVISOR"); this is for display only.
export const REVIEWER_ROLE_LABEL: Record<string, string> = {
  SUPERVISOR: 'Supervisor',
  MEDTECH: 'MedTech',
};

export function reviewerRoleLabel(role: string): string {
  return REVIEWER_ROLE_LABEL[role.toUpperCase()] ?? role;
}
