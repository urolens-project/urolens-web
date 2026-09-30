import { PatientRegistrationForm } from './components/PatientRegistrationForm';

export default function PatientRegistrationPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register New Patient</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
        Add a new patient so they can be registered for lab requests and results.
      </p>
      <div className="mt-8">
        <PatientRegistrationForm />
      </div>
    </div>
  );
}
