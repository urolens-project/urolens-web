// The backend stores test_type as entered but hasn't shipped a separate
// display label yet, so this is the frontend's own formatting for now.
export function formatTestType(testType: string | null): string {
  return testType ? testType.replace(/_/g, ' ') : '—';
}
