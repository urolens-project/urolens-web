export const UserRole = {
  RECEPTIONIST: 'receptionist',
  SUPERVISOR: 'supervisor',
  PHYSICIAN: 'physician',
  PATIENT: 'patient',
  ADMINISTRATOR: 'administrator',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
