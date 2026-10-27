import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Anchor, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { AdminUser, UserRole } from '../../types';
import { loginWithGoogle } from '../../services/firebase';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Harap isi username/email dan password.');
      return;
    }

    // Accept common admin credentials
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        const adminUser: AdminUser = {
          id: user.uid,
          username: user.email?.split('@')[0] || 'admin',
          email: user.email || 'admin@arslogistic.id',
          displayName: user.displayName || 'Authorized Admin',
          role: 'Super Admin',
          avatarUrl: user.photoURL || undefined
        };
        onLoginSuccess(adminUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg('Login Google gagal atau dibatalkan: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
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
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
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

        {/* Google Login Alternative */}
        <div className="space-y-3 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase">Atau</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>
        </div>

        {/* Quick Demo Credentials */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block text-center">
            Pintasan Login Cepat (Klik untuk Otomatis):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('arsypideksa12@gmail.com', 'Super Admin')}
              className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/70 text-left text-[11px] text-cyan-300 transition-colors"
            >
              <div className="font-bold text-white">Owner / Admin</div>
              <div className="text-[10px] text-slate-400 truncate">arsypideksa12@gmail.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@arslogistic.id', 'Super Admin')}
              className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/70 text-left text-[11px] text-cyan-300 transition-colors"
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
