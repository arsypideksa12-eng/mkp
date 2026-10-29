import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Anchor, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminUser, UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin@arslogistic.id');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Harap isi username/email dan password.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    const adminUser: AdminUser = {
      id: `admin-${Date.now()}`,
      username: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail,
      email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@arslogistic.id`,
      displayName: usernameOrEmail.includes('arsy') ? 'Arsy Pideksa (Admin Utama)' : 'Administrator ARS Logistik',
      role: selectedRole,
    };

    onLoginSuccess(adminUser);
    onClose();
  };

  const handleQuickFill = (email: string, role: UserRole) => {
    setUsernameOrEmail(email);
    setPassword('admin123');
    setSelectedRole(role);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-cyan-400/40">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Login Admin ARS Logistik</h2>
          <p className="text-xs text-slate-400">
            Sistem Autentikasi Pengelola Muatan Kapal & Tiket Penumpang
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          
          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Username atau Email Admin</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="admin@arslogistic.id"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Hak Akses / Peran (Role)</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Super Admin">Super Admin (Akses Penuh)</option>
              <option value="Harbor Master">Harbor Master (Syahbandar & Jadwal)</option>
              <option value="Cargo Officer">Cargo Officer (Petugas Muatan Kargo)</option>
              <option value="Ticket Cashier">Ticket Cashier (Kasir Tiket Penumpang)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all border border-cyan-400/30 flex items-center justify-center space-x-2 active:scale-98"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block text-center">
            Pintasan Login Cepat (Klik untuk Otomatis):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('arsypideksa12@gmail.com', 'Super Admin')}
              className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/70 text-left text-[11px] text-cyan-300 transition-colors"
            >
              <div className="font-bold text-white">Owner / Admin</div>
              <div className="text-[10px] text-slate-400 truncate">arsypideksa12@gmail.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@arslogistic.id', 'Harbor Master')}
              className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/70 text-left text-[11px] text-cyan-300 transition-colors"
            >
              <div className="font-bold text-white">Operator Kapal</div>
              <div className="text-[10px] text-slate-400 truncate">admin@arslogistic.id</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
