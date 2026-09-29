export function formatAge(age: number | null, sex: string | null): string {
  const parts: string[] = [];
  if (age !== null) parts.push(`${age}y`);
  if (sex) parts.push(sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase());
  return parts.join(' / ') || '—';
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// The backend doesn't send sample_uid on the queue list endpoints yet, so
// this falls back to a truncated specimen_id — display only, never used to
// look the specimen up. Swap to sample_uid the moment the API sends it.
export function formatSampleId(sampleUid: string | null | undefined, specimenId: string): string {
  return sampleUid ?? specimenId.slice(0, 8).toUpperCase();
}
