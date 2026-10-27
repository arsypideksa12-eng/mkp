import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Navigation, 
  Clock, 
  DollarSign, 
  X, 
  Check, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { Route } from '../../types';

interface RoutesMasterProps {
  routes: Route[];
  onSaveRoute: (route: Route) => Promise<void>;
  onDeleteRoute: (routeId: string) => Promise<void>;
  isLoading: boolean;
}

const COMMON_PORTS = [
  'Pelabuhan Tanjung Priok (Jakarta)',
  'Pelabuhan Tanjung Perak (Surabaya)',
  'Pelabuhan Soekarno-Hatta (Makassar)',
  'Pelabuhan Semayang (Balikpapan - IKN)',
  'Pelabuhan Batu Ampar (Batam)',
  'Pelabuhan Belawan (Medan)',
  'Pelabuhan Tanjung Emas (Semarang)',
  'Pelabuhan Benoa (Denpasar Bali)',
  'Pelabuhan Lembar (Lombok)',
  'Pelabuhan Tenau (Kupang)',
  'Pelabuhan Bitung (Manado)',
  'Pelabuhan Ambon (Yos Sudarso)',
  'Pelabuhan Sorong (Papua Barat Daya)',
  'Pelabuhan Jayapura'
];

export const RoutesMaster: React.FC<RoutesMasterProps> = ({
  routes,
  onSaveRoute,
  onDeleteRoute,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [originPort, setOriginPort] = useState(COMMON_PORTS[0]);
  const [customOrigin, setCustomOrigin] = useState('');
  const [destinationPort, setDestinationPort] = useState(COMMON_PORTS[1]);
  const [customDestination, setCustomDestination] = useState('');
  const [distanceNm, setDistanceNm] = useState(380);
  const [estimatedHours, setEstimatedHours] = useState(24);
  const [basePassengerFare, setBasePassengerFare] = useState(280000);
  const [baseCargoRatePerTon, setBaseCargoRatePerTon] = useState(450000);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const openAddModal = () => {
    setEditingRoute(null);
    setOriginPort(COMMON_PORTS[0]);
    setCustomOrigin('');
    setDestinationPort(COMMON_PORTS[1]);
    setCustomDestination('');
    setDistanceNm(400);
    setEstimatedHours(24);
    setBasePassengerFare(300000);
    setBaseCargoRatePerTon(500000);
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (route: Route) => {
    setEditingRoute(route);
    setOriginPort(COMMON_PORTS.includes(route.originPort) ? route.originPort : 'OTHER');
    setCustomOrigin(COMMON_PORTS.includes(route.originPort) ? '' : route.originPort);
    setDestinationPort(COMMON_PORTS.includes(route.destinationPort) ? route.destinationPort : 'OTHER');
    setCustomDestination(COMMON_PORTS.includes(route.destinationPort) ? '' : route.destinationPort);
    setDistanceNm(route.distanceNm);
    setEstimatedHours(route.estimatedHours);
    setBasePassengerFare(route.basePassengerFare);
    setBaseCargoRatePerTon(route.baseCargoRatePerTon);
    setStatus(route.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOrigin = originPort === 'OTHER' ? customOrigin.trim() : originPort;
    const finalDestination = destinationPort === 'OTHER' ? customDestination.trim() : destinationPort;

    if (!finalOrigin || !finalDestination) return;

    const routeData: Route = {
      id: editingRoute ? editingRoute.id : `route-${Date.now()}`,
      originPort: finalOrigin,
      destinationPort: finalDestination,
      distanceNm: Number(distanceNm),
      estimatedHours: Number(estimatedHours),
      basePassengerFare: Number(basePassengerFare),
      baseCargoRatePerTon: Number(baseCargoRatePerTon),
      status,
      createdAt: editingRoute?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveRoute(routeData);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await onDeleteRoute(id);
    setDeletingId(null);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredRoutes = routes.filter(route => {
    const matchSearch = route.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        route.destinationPort.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || route.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span>Master Data Rute Pelayaran & Pelabuhan</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pengaturan koridor pelayaran antarpulau, jarak mil laut, durasi berlayar, serta tarif dasar muatan kargo dan tiket.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 text-sm border border-cyan-400/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Rute Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pelabuhan asal / tujuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Aktif Beroperasi</option>
            <option value="Inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Routes List */}
      <div className="rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4">Pelabuhan Asal & Tujuan</th>
                <th className="py-3.5 px-4 text-center">Jarak Laut (NM)</th>
                <th className="py-3.5 px-4 text-center">Estimasi Waktu</th>
                <th className="py-3.5 px-4">Tarif Dasar Penumpang</th>
                <th className="py-3.5 px-4">Tarif Dasar Kargo / Ton</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{route.originPort}</span>
                          <span className="text-cyan-400 font-bold">➔</span>
                          <span className="font-bold text-white text-sm">{route.destinationPort}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Koridor Jalur Pelayaran Resmi</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-semibold text-slate-200">
                      <div className="inline-flex items-center space-x-1">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        <span>{route.distanceNm} NM</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center text-slate-300">
                      <div className="inline-flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>~{route.estimatedHours} Jam</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-violet-300">
                      {formatRupiah(route.basePassengerFare)}
                      <span className="text-[11px] text-slate-400 font-normal block">Ekonomi Dek</span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-cyan-300">
                      {formatRupiah(route.baseCargoRatePerTon)}
                      <span className="text-[11px] text-slate-400 font-normal block">Per Tonase</span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        route.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}>
                        {route.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(route)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Rute"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(route.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hapus Rute"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada rute yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Konfirmasi Hapus Rute</h3>
            <p className="text-sm text-slate-400">
              Apakah Anda yakin ingin menghapus data rute pelayaran ini?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingRoute ? 'Edit Rute Pelayaran' : 'Tambah Rute Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">Atur pelabuhan asal, tujuan, jarak mil laut, dan tarif</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Pelabuhan Asal */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pelabuhan Asal *</label>
                  <select
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {COMMON_PORTS.map((port) => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                    <option value="OTHER">Lainnya (Input Manual)...</option>
                  </select>
                  {originPort === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="Ketik nama pelabuhan asal..."
                      value={customOrigin}
                      onChange={(e) => setCustomOrigin(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  )}
                </div>

                {/* Pelabuhan Tujuan */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pelabuhan Tujuan *</label>
                  <select
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {COMMON_PORTS.map((port) => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                    <option value="OTHER">Lainnya (Input Manual)...</option>
                  </select>
                  {destinationPort === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="Ketik nama pelabuhan tujuan..."
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  )}
                </div>

                {/* Jarak Mil Laut (NM) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Jarak Mil Laut (NM) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={distanceNm}
                    onChange={(e) => setDistanceNm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Estimasi Durasi */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Estimasi Durasi (Jam) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Tarif Dasar Penumpang */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tarif Dasar Penumpang (IDR) *</label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={basePassengerFare}
                    onChange={(e) => setBasePassengerFare(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Tarif Dasar Kargo Per Ton */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tarif Kargo Per Ton (IDR) *</label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={baseCargoRatePerTon}
                    onChange={(e) => setBaseCargoRatePerTon(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Status Jalur Rute</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Active">Aktif Beroperasi</option>
                    <option value="Inactive">Nonaktif / Ditutup Sementara</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-600/30 border border-cyan-400/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRoute ? 'Simpan Rute' : 'Tambah Rute'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
