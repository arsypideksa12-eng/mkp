import React from 'react';
import { 
  Ship, 
  Anchor, 
  ShieldCheck, 
  Database, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { AdminUser } from '../types';

interface NavbarProps {
  currentUser: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  isCloudConnected: boolean;
  onSyncDb: () => void;
  isSyncing: boolean;
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onToggleMobileMenu,
  isCloudConnected,
  onSyncDb,
  isSyncing,
  activeView,
  onSelectView,
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Buka Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div 
              onClick={() => onSelectView('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 border border-cyan-400/30">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base md:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-white">
                    ARS LOGISTIC
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                    MARITIME
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  & PASSENGER SERVICE INDONESIA
                </p>
              </div>
            </div>
          </div>

          {/* Quick Database Status & Controls */}
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={() => onSelectView('database_sync')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isCloudConnected 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50' 
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <Database className="w-3.5 h-3.5" />
              <span>{isCloudConnected ? 'Firebase Cloud: Terhubung' : 'Local Cache / Standby'}</span>
            </button>

            <button
              onClick={onSyncDb}
              disabled={isSyncing}
              title="Refresh Sinkronisasi Database"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>
          </div>

          {/* Admin Account & Login / Logout */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-slate-200">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[11px] font-medium text-cyan-400 flex items-center justify-end space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 p-0.5 shadow-md">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-cyan-300 font-bold text-sm">
                    {currentUser.displayName.charAt(0)}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Logout Admin"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-800/40"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95 border border-cyan-400/30"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login Admin</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
