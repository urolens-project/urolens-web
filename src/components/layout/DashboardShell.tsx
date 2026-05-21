import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Barcode,
  Bell,
  ChevronRight,
  FileText,
  FlaskConical,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

const navItems = [
  {
    to: '/intake/register',
    label: 'Patient Intake',
    description: 'Patient registration workflow',
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
    to: '/intake/queue',
    label: 'Labeling & Queue',
    description: 'Queue monitoring & barcode labels',
    icon: Barcode,
  },
];

export default function DashboardShell() {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#F4F7F5] text-slate-800 font-sans antialiased">
      {/* ---------------------------------------------------------------- */}
      {/* SIDEBAR CONTAINER */}
      {/* ---------------------------------------------------------------- */}
      <aside className="relative hidden w-72 shrink-0 flex-col border-r border-emerald-100 bg-white xl:flex">
        
        {/* LOGO BRAND BANNER */}
        <div className="px-6 h-20 border-b border-emerald-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-xs">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                UroLens LIS
              </h1>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-emerald-600/80">
                Laboratory Information System
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold tracking-wider bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100/50">
            F1
          </span>
        </div>

        {/* WORKSPACE OPERATOR PROFILE SUMMARY */}
        <div className="px-6 py-5 border-b border-emerald-50/60 bg-emerald-50/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs">
              AR
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 leading-none">Aliyah Regacho</p>
              <p className="text-[10px] text-slate-400 mt-1 truncate">Clinical Desk Administrator</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-md px-2.5 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>System Active & Secure</span>
          </div>
        </div>

        {/* COMPACT ROUTE LINKS */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 mb-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700/60">Main Operations</p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to} className="block no-underline">
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 border ${
                      isActive
                        ? 'bg-emerald-50 border-emerald-100/70 text-emerald-700 font-semibold shadow-xs'
                        : 'border-transparent text-slate-500 hover:bg-emerald-50/40 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                    <span className="text-xs tracking-wide flex-1 truncate">
                      {item.label}
                    </span>
                    <ChevronRight className={`h-3 w-3 shrink-0 transition-all ${isActive ? 'text-emerald-600 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* SYSTEM UTILITY SIDEBAR FOOTER */}
        <div className="border-t border-emerald-50/60 p-4 flex items-center gap-2 bg-emerald-50/10">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 h-9 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            Settings
          </button>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* MAIN LAYOUT CANVAS CONTAINER */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        
        {/* COMPACT GLOSSY TOPBAR */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-20 items-center justify-between px-8">
            
            {/* TITLE ROUTE CONTEXT */}
            <div className="flex items-center gap-4">
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 xl:hidden">
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Intake Workspace
                </span>
                <h1 className="text-lg font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  Reception Management Node
                </h1>
              </div>
            </div>

            {/* INTEGRATION ACCESSORIES */}
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search identity reference sequence..."
                  className="h-10 w-72 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none transition-all focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </button>
            </div>

          </div>
        </header>

        {/* ROUTED COMPONENT SCREEN CONTAINER */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 lg:p-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}