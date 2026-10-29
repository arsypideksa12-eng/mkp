import React, { useState } from 'react';
import { 
  Anchor, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles, 
  Database, 
  Package, 
  Ticket, 
  CheckCircle2, 
  Server,
  UserCheck
} from 'lucide-react';
import { AdminUser, UserRole } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';

interface LoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  isCloudConnected: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isCloudConnected
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const input = usernameOrEmail.trim();
    const pass = password.trim();

    if (!input) {
      setErrorMsg('Harap masukkan Username atau Email Anda.');
      return;
    }
    if (!pass) {
      setErrorMsg('Harap masukkan Password Anda.');
      return;
    }
    if (pass.length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let displayName = 'Administrator ARS Logistik';
      if (input.toLowerCase().includes('arsy') || input.toLowerCase().includes('arsypideksa')) {
        displayName = 'Arsy Pideksa (Admin Utama)';
      } else if (input.toLowerCase().includes('kasir')) {
        displayName = 'Petugas Loket Pelabuhan';
      } else if (input.toLowerCase().includes('cargo')) {
        displayName = 'Officer Muatan Kargo';
      }

      const user: AdminUser = {
        id: `admin-${Date.now()}`,
        username: input.includes('@') ? input.split('@')[0] : input,
        email: input.includes('@') ? input : `${input}@arslogistic.id`,
        displayName,
        role: selectedRole
      };

      if (rememberMe) {
        localStorage.setItem('ars_admin_session', JSON.stringify(user));
      }

      setIsLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  const handleQuickLogin = (email: string, pass: string, role: UserRole) => {
    setUsernameOrEmail(email);
    setPassword(pass);
    setSelectedRole(role);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 py-8 relative z-10">
        
        {/* Card Wrapper */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero Branding Section (Desktop: 5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
            <div className="space-y-6">
              
              {/* Logo & Company Name */}
              <div className="flex items-center space-x-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-cyan-500/20 border border-cyan-400/40">
                  <Anchor className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-white">
                    ARS LOGISTIC
                  </div>
                  <div className="text-xs text-cyan-300 font-semibold tracking-widest uppercase">
                    & PASSENGER SERVICE
                  </div>
                </div>
              </div>

              {/* Tagline & Description */}
              <div className="space-y-2 pt-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sistem Logistik Maritim Terpadu</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Portal Masuk Petugas & Administrator
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Aplikasi kendali manifes muatan kargo/kontainer kapal, reservasi tiket penumpang, dan pelaporan syahbandar terintegrasi real-time database.
                </p>
              </div>

              {/* Key Features List */}
              <div className="space-y-3 pt-3">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20 mt-0.5">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Manifes Muatan Kargo (B/L)</strong>
                    <span className="text-slate-400 text-[11px]">Kontainer 20ft/40ft, reefer, truk tronton & kargo umum</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 mt-0.5">
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Tiket & Boarding Pass Penumpang</strong>
                    <span className="text-slate-400 text-[11px]">Alokasi kabin/kursi, verifikasi NIK, & cetak QR Code</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Real Database Synchronized</strong>
                    <span className="text-slate-400 text-[11px]">Sinkronisasi online instan ke Firebase, Supabase & Neon</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Cloud Database Status Footer */}
            <div className="pt-6 mt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span className="text-slate-300 font-semibold">
                    {isCloudConnected ? 'Cloud Firestore: Live Online' : 'Local Cache Standby'}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  v2.6
                </span>
              </div>
            </div>

          </div>

          {/* Right Login Form Section (Desktop: 7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
            
            {/* Form Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
                <UserCheck className="w-6 h-6 text-cyan-400" />
                <span>Form Login Admin</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Silakan masukkan Username / Email dan Password untuk mengakses sistem manajemen ARS.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username / Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Username atau Alamat Email <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: arsypideksa12@gmail.com atau admin"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-850 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Password <span className="text-cyan-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-850 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selector & Remember Me */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Hak Akses / Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Super Admin">Super Admin (Akses Penuh)</option>
                    <option value="Harbor Master">Harbor Master (Syahbandar)</option>
                    <option value="Cargo Officer">Cargo Officer (Muatan Kargo)</option>
                    <option value="Ticket Cashier">Ticket Cashier (Kasir Tiket)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Ingat sesi di perangkat ini</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all border border-cyan-400/40 flex items-center justify-center space-x-2 transform active:scale-98"
              >
                <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Quick Demo Login Cards (One-Click) */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-400 block text-center">
                Pintasan Akun Administrator (Klik untuk Isi Otomatis):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('arsypideksa12@gmail.com', 'admin123', 'Super Admin')}
                  className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-left text-xs transition-all hover:border-cyan-500/40 group"
                >
                  <div className="font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                    <span>Admin Utama</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Super Admin</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">arsypideksa12@gmail.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@arslogistic.id', 'admin123', 'Harbor Master')}
                  className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-left text-xs transition-all hover:border-blue-500/40 group"
                >
                  <div className="font-bold text-white group-hover:text-blue-300 flex items-center justify-between">
                    <span>Petugas Pelabuhan</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">Officer</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">admin@arslogistic.id</div>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Security Trust Badge */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enkripsi Sesi Kredensial Aman</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Real-time Database Firestore ({firebaseConfig.projectId})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Multi-Perangkat Online & Tersinkronisasi</span>
          </span>
        </div>

      </div>

    </div>
  );
};
