import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Barcode, ClipboardList, FileText, FlaskConical,
  LogOut, Menu, Settings, UserPlus, Send
} from 'lucide-react';
import { useAuthContext } from '../../lib/auth/useAuthContext';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import { Modal } from '../ui/Modal';

const navItems = [
  {
    to: '/intake/register',
    label: 'Register Patient',
    description: 'New patient account registration',
    icon: UserPlus,
  },
  {
    to: '/intake/request',
    label: 'Lab Requests',
    description: 'Clinical laboratory requests',
    icon: FileText,
  },
  {
    to: '/intake/receive',
    label: 'Specimen Intake',
    description: 'Specimen receiving & validation',
    icon: FlaskConical,
  },
  {
    to: '/intake/label',
    label: 'Sample Labeling',
    description: 'Barcode label printing & affixing',
    icon: Barcode,
  },
  {
    to: '/intake/queue',
    label: 'Queue Assignment',
    description: 'Specimen to MedTech queue assignment',
    icon: ClipboardList,
  }, 
  {
    to: '/receptionist/results/approved',
    label: 'Release Results',
    description: 'Release approved results to patients',
    icon: Send,
  }
];

export default function DashboardShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout: performLogout, role } = useAuthContext();
  const { isWarningVisible, dismissWarning } = useSessionTimeout();

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    : 'User';

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#F4F7F5] text-slate-800 font-sans antialiased">

      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="relative shrink-0 flex-col border-r border-emerald-100 bg-white flex"
          >
            {/* LOGO BRAND BANNER */}
            <div className="px-6 h-20 border-b border-emerald-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-xs">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">UroLens LIS</h1>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-emerald-600/80">Laboratory System</p>
                </div>
              </div>
            </div>

            {/* WORKSPACE OPERATOR PROFILE */}
            <div className="px-6 py-5 border-b border-emerald-50/60 bg-emerald-50/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs">
                  {roleLabel.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{roleLabel}</p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">UroLens LIS</p>
                </div>
              </div>
            </div>

            {/* NAVIGATION LINKS */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              <div className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-emerald-700/60">Main Operations</div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} className="block no-underline">
                    {({ isActive }) => (
                      <div className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                        isActive ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs' : 'text-slate-500 hover:bg-emerald-50/40'
                      }`}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-xs tracking-wide flex-1 truncate">{item.label}</span>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* SIDEBAR FOOTER */}
            <div className="border-t border-emerald-50/60 p-4 flex items-center gap-2 bg-emerald-50/10">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 h-9 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Settings className="h-3.5 w-3.5 text-slate-400" /> Settings
              </button>
              <button
                onClick={performLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-20 items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Intake Workspace</span>
                <h1 className="text-lg font-black text-slate-900 tracking-tight mt-1.5">Reception Management Node</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 lg:p-12">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal open={isWarningVisible} onClose={dismissWarning} title="Session Expiring Soon" maxWidth="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Your session will expire in 2 minutes due to inactivity. Move your mouse or press any key to stay signed in.
          </p>
          <button
            onClick={dismissWarning}
            className="w-full h-10 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
          >
            Stay Signed In
          </button>
        </div>
      </Modal>

    </div>
  );
}