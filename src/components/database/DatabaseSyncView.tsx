import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Copy, 
  ExternalLink, 
  Server, 
  Cloud, 
  HardDrive, 
  Check, 
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Ship, Route, Schedule, CargoShipment, PassengerTicket } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';
import { testFirestoreConnection, seedInitialFirestoreData } from '../../services/firebase';
import { generatePostgreSqlDump, downloadFile } from '../../services/databaseExporter';

interface DatabaseSyncViewProps {
  ships: Ship[];
  routes: Route[];
  schedules: Schedule[];
  cargo: CargoShipment[];
  tickets: PassengerTicket[];
  onRefreshData: () => Promise<void>;
  isSyncing: boolean;
}

export const DatabaseSyncView: React.FC<DatabaseSyncViewProps> = ({
  ships,
  routes,
  schedules,
  cargo,
  tickets,
  onRefreshData,
  isSyncing
}) => {
  const [activeDbTab, setActiveDbTab] = useState<'firebase' | 'supabase' | 'neondb'>('firebase');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Generate current PostgreSQL DDL & DML Dump for Supabase / Neon
  const supabaseSql = generatePostgreSqlDump({ ships, routes, schedules, cargo, tickets }, 'Supabase');
  const neonSql = generatePostgreSqlDump({ ships, routes, schedules, cargo, tickets }, 'Neon DB');

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testFirestoreConnection();
      setTestResult(res.message);
    } catch (e: any) {
      setTestResult('Gagal terhubung: ' + (e.message || String(e)));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedInitialFirestoreData();
      if (res.success) {
        setSeedResult(`Berhasil menginjeksi ${res.count} dokumen awal ke database Firebase Firestore!`);
        await onRefreshData();
      } else {
        setSeedResult(`Gagal seed: ${res.error}`);
      }
    } catch (e: any) {
      setSeedResult('Error saat seeding: ' + (e.message || String(e)));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopySql = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = (target: 'Supabase' | 'Neon DB') => {
    const content = target === 'Supabase' ? supabaseSql : neonSql;
    const filename = `ars_maritime_${target.toLowerCase().replace(' ', '_')}_dump.sql`;
    downloadFile(content, filename, 'application/sql');
  };

  const handleDownloadJson = () => {
    const fullBackup = {
      app: 'ARS LOGISTIC AND PASSENGER SERVICE',
      version: '2.6',
      exportedAt: new Date().toISOString(),
      collections: {
        ships,
        routes,
        schedules,
        cargo_shipments: cargo,
        passenger_tickets: tickets
      }
    };
    downloadFile(JSON.stringify(fullBackup, null, 2), `ars_firebase_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
          <Database className="w-6 h-6 text-cyan-400" />
          <span>Integrasi Real Database: Firebase, Supabase & Neon DB</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Koneksi aktif ke Cloud Firestore dengan sinkronisasi real-time antar-perangkat, plus generator skema & dump SQL otomatis untuk Supabase dan Neon DB Postgres.
        </p>
      </div>

      {/* Database Platform Switcher */}
      <div className="flex flex-wrap items-center gap-3 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveDbTab('firebase')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeDbTab === 'firebase'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Google Firebase (Aktif Terhubung)</span>
        </button>

        <button
          onClick={() => setActiveDbTab('supabase')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeDbTab === 'supabase'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Supabase (PostgreSQL)</span>
        </button>

        <button
          onClick={() => setActiveDbTab('neondb')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeDbTab === 'neondb'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Neon DB (Serverless Postgres)</span>
        </button>
      </div>

      {/* TAB 1: FIREBASE CLOUD FIRESTORE */}
      {activeDbTab === 'firebase' && (
        <div className="space-y-6">
          
          {/* Cloud Info Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-orange-950/40 border border-orange-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-orange-600/30">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>Google Cloud Firestore Status</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ● Live Connected
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Database NoSQL real-time tersinkronisasi online di semua perangkat</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji...' : 'Uji Koneksi Cloud'}</span>
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Backup JSON</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}

            {/* Config Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Project ID</span>
                <div className="font-mono text-sm font-bold text-orange-300 truncate" title={firebaseConfig.projectId}>
                  {firebaseConfig.projectId}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Database ID</span>
                <div className="font-mono text-sm font-bold text-orange-300 truncate" title={firebaseConfig.firestoreDatabaseId}>
                  {firebaseConfig.firestoreDatabaseId}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Auth Domain</span>
                <div className="font-mono text-sm font-bold text-slate-200 truncate" title={firebaseConfig.authDomain}>
                  {firebaseConfig.authDomain}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Sinkronisasi</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Multi-Device Online</span>
                </div>
              </div>
            </div>

            {/* Collection Counters */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Koleksi Data Aktif di Cloud Firestore:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xl font-extrabold text-white">{ships.length}</div>
                  <div className="text-xs text-slate-400">ships (Kapal)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xl font-extrabold text-white">{routes.length}</div>
                  <div className="text-xs text-slate-400">routes (Rute)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xl font-extrabold text-white">{schedules.length}</div>
                  <div className="text-xs text-slate-400">schedules (Jadwal)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xl font-extrabold text-cyan-400">{cargo.length}</div>
                  <div className="text-xs text-slate-400">cargo_shipments</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xl font-extrabold text-violet-400">{tickets.length}</div>
                  <div className="text-xs text-slate-400">passenger_tickets</div>
                </div>
              </div>
            </div>

            {/* Seed Button */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <strong className="text-sm text-slate-200 block">Isi Data Awal Realistis (Seed Data)</strong>
                <p className="text-xs text-slate-400">
                  Kirim armada kapal, rute antar pulau Indonesia, jadwal pelayaran, dan transaksi B/L langsung ke Cloud Firestore.
                </p>
              </div>

              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-lg shadow-orange-600/30 transition-all border border-orange-400/30"
              >
                <Sparkles className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Menyuntikkan Data...' : 'Seed Data ke Firestore Cloud'}</span>
              </button>
            </div>

            {seedResult && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{seedResult}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: SUPABASE POSTGRESQL */}
      {activeDbTab === 'supabase' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-850/80 border border-emerald-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Supabase PostgreSQL Schema & Data DDL</h2>
                  <p className="text-xs text-slate-400">
                    Skrip SQL siap pakai untuk Supabase SQL Editor lengkap dengan tabel relasional & data transaksi
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleCopySql(supabaseSql)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  onClick={() => handleDownloadSql('Supabase')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .SQL Script</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Pratinjau Kode SQL Supabase:</span>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {supabaseSql}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NEON DB SERVERLESS POSTGRES */}
      {activeDbTab === 'neondb' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-850/80 border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-cyan-600/30">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Neon DB Serverless Postgres Schema</h2>
                  <p className="text-xs text-slate-400">
                    Skrip migrasi database serverless PostgreSQL yang optimal untuk branching database di Neon.tech
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleCopySql(neonSql)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  onClick={() => handleDownloadSql('Neon DB')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Neon .SQL</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Pratinjau Kode SQL Neon DB:</span>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-96 leading-relaxed">
                {neonSql}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
