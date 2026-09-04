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
