// Barrel for the multi-field verification workspace (proposal §10.1).
//
// NOT wired into src/App.tsx or any RoleShell nav yet, on purpose: every
// backend route this feature calls is a stub as of PR #91
// (feat/multifield-foundation) — 404 FEATURE_DISABLED with the flag
// off, 501 NOT_IMPLEMENTED with it on. Routing a real MedTech here
// today would replace their working single-image confirmation flow
// (features/medtech-confirmation) with a screen that cannot function.
//
// To wire this in once the backend lanes land real implementations:
//   1. Add routes in src/App.tsx under the MEDTECH RequireRole block:
//        /dashboard/medtech          -> VerificationQueuePage
//        /medtech/verify/:resultId   -> MedTechVerificationPage
//      (these currently point at medtech-confirmation's queue/detail —
//      decide whether this replaces that feature or the two coexist
//      during a transition, per the proposal's "release together" note
//      in §10.4.)
//   2. Confirm docs/contract/field-shapes.json still matches this
//      feature's types.ts (re-export it, or diff by hand) — it may
//      have moved since this was written.
export { VerificationQueuePage } from './components/VerificationQueuePage';
export { MedTechVerificationPage } from './components/MedTechVerificationPage';
export { FieldGrid } from './components/FieldGrid';
export { FieldAnnotationEditor } from './components/FieldAnnotationEditor';
export { FieldCountsPanel } from './components/FieldCountsPanel';
export { VerificationSummary } from './components/VerificationSummary';
export { ConfirmResultDialog } from './components/ConfirmResultDialog';
