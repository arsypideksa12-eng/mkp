import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Ship, 
  MapPin, 
  Clock, 
  Users, 
  Package, 
  X, 
  Check, 
  SlidersHorizontal,
  Navigation
} from 'lucide-react';
import { Schedule, Ship as ShipModel, Route, ScheduleStatus } from '../../types';

interface SchedulesManagerProps {
  schedules: Schedule[];
  ships: ShipModel[];
  routes: Route[];
  onSaveSchedule: (schedule: Schedule) => Promise<void>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  isLoading: boolean;
}

export const SchedulesManager: React.FC<SchedulesManagerProps> = ({
  schedules,
  ships,
  routes,
  onSaveSchedule,
  onDeleteSchedule,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [voyageNumber, setVoyageNumber] = useState('');
  const [shipId, setShipId] = useState(ships[0]?.id || '');
  const [routeId, setRouteId] = useState(routes[0]?.id || '');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [status, setStatus] = useState<ScheduleStatus>('Scheduled');
  const [bookedPassengers, setBookedPassengers] = useState(0);
  const [bookedCargoTons, setBookedCargoTons] = useState(0);

  const openAddModal = () => {
    setEditingSchedule(null);
    setVoyageNumber(`VOY-ARS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setShipId(ships[0]?.id || '');
    setRouteId(routes[0]?.id || '');
    
    // Default times: tomorrow 09:00, arrival next day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setHours(dayAfter.getHours() + 24);

    setDepartureTime(tomorrow.toISOString().slice(0, 16));
    setArrivalTime(dayAfter.toISOString().slice(0, 16));
    setStatus('Scheduled');
    setBookedPassengers(0);
    setBookedCargoTons(0);
    setIsModalOpen(true);
  };

  const openEditModal = (sc: Schedule) => {
    setEditingSchedule(sc);
    setVoyageNumber(sc.voyageNumber);
    setShipId(sc.shipId);
    setRouteId(sc.routeId);
    setDepartureTime(sc.departureTime ? sc.departureTime.slice(0, 16) : '');
    setArrivalTime(sc.arrivalTime ? sc.arrivalTime.slice(0, 16) : '');
    setStatus(sc.status);
    setBookedPassengers(sc.bookedPassengers || 0);
    setBookedCargoTons(sc.bookedCargoTons || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedShip = ships.find(s => s.id === shipId) || ships[0];
    const selectedRoute = routes.find(r => r.id === routeId) || routes[0];

    const schedData: Schedule = {
      id: editingSchedule ? editingSchedule.id : `sched-${Date.now()}`,
      voyageNumber: voyageNumber.trim().toUpperCase(),
      shipId,
      shipName: selectedShip?.name || 'KM. ARS Nusantara',
      routeId,
      originPort: selectedRoute?.originPort || 'Pelabuhan Tanjung Priok (Jakarta)',
      destinationPort: selectedRoute?.destinationPort || 'Pelabuhan Tanjung Perak (Surabaya)',
      departureTime,
      arrivalTime,
      status,
      bookedPassengers: Number(bookedPassengers),
      bookedCargoTons: Number(bookedCargoTons),
      createdAt: editingSchedule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveSchedule(schedData);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await onDeleteSchedule(id);
    setDeletingId(null);
  };

  const filteredSchedules = schedules.filter(sc => {
    const matchSearch = sc.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sc.shipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sc.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sc.destinationPort.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || sc.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
            <span>Jadwal Pelayaran & Voyage Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Penetapan nomor pelayaran (voyage), alokasi armada kapal, jalur rute, estimasi ETD/ETA, serta okupansi muatan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 text-sm border border-cyan-400/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Jadwal Pelayaran</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari voyage, nama kapal, rute pelabuhan..."
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
            <option value="All">Semua Status Pelayaran</option>
            <option value="Scheduled">Scheduled (Terjadwal)</option>
            <option value="Boarding">Boarding (Muat & Naik Kapal)</option>
            <option value="Sailing">Sailing (Sedang Berlayar)</option>
            <option value="Arrived">Arrived (Telah Bersandar)</option>
            <option value="Delayed">Delayed (Tertunda Cuaca/Teknis)</option>
            <option value="Cancelled">Cancelled (Dibatalkan)</option>
          </select>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4">No. Voyage & Kapal</th>
                <th className="py-3.5 px-4">Rute Pelayaran</th>
                <th className="py-3.5 px-4">Waktu Keberangkatan (ETD)</th>
                <th className="py-3.5 px-4">Waktu Tiba (ETA)</th>
                <th className="py-3.5 px-4 text-center">Beban Muatan & Pax</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((sc) => {
                  const assignedShip = ships.find(s => s.id === sc.shipId);
                  const cargoPercent = assignedShip && assignedShip.cargoCapacityTons > 0
                    ? Math.min(100, Math.round((sc.bookedCargoTons / assignedShip.cargoCapacityTons) * 100))
                    : 0;

                  return (
                    <tr key={sc.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Voyage & Ship */}
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-cyan-300 text-sm">
                          {sc.voyageNumber}
                        </div>
                        <div className="font-semibold text-white text-sm mt-0.5 flex items-center space-x-1.5">
                          <Ship className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sc.shipName}</span>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-200 font-medium">
                          {sc.originPort}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-bold my-0.5">
                          ➔ {sc.destinationPort}
                        </div>
                      </td>

                      {/* ETD */}
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-200 font-semibold">
                          {new Date(sc.departureTime).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{new Date(sc.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                        </div>
                      </td>

                      {/* ETA */}
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-200 font-semibold">
                          {new Date(sc.arrivalTime).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{new Date(sc.arrivalTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="py-4 px-4 text-center">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-300 font-semibold">
                            {sc.bookedCargoTons} Ton / {assignedShip?.cargoCapacityTons || 0} Ton
                          </div>
                          <div className="w-24 mx-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${cargoPercent > 80 ? 'bg-amber-400' : 'bg-cyan-400'}`} 
                              style={{ width: `${cargoPercent}%` }}
                            />
                          </div>
                          {assignedShip && assignedShip.passengerCapacity > 0 && (
                            <div className="text-[11px] text-slate-400">
                              {sc.bookedPassengers} / {assignedShip.passengerCapacity} Pax
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          sc.status === 'Sailing'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : sc.status === 'Boarding'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : sc.status === 'Arrived'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}>
                          ● {sc.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(sc)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Jadwal"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(sc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada jadwal pelayaran yang ditemukan.
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
            <h3 className="text-lg font-bold text-white">Konfirmasi Hapus Jadwal Pelayaran</h3>
            <p className="text-sm text-slate-400">
              Apakah Anda yakin ingin membatalkan dan menghapus jadwal pelayaran kapal ini?
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

      {/* Add / Edit Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingSchedule ? 'Edit Jadwal Pelayaran' : 'Terbitkan Jadwal Pelayaran Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">Atur nomor voyage, kapal, rute, dan jadwal keberangkatan</p>
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
                
                {/* Voyage Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nomor Pelayaran (Voyage) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: VOY-ARS-2026-088"
                    value={voyageNumber}
                    onChange={(e) => setVoyageNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Pelayaran *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Scheduled">Scheduled (Terjadwal)</option>
                    <option value="Boarding">Boarding (Muat Barang/Penumpang)</option>
                    <option value="Sailing">Sailing (Sedang Berlayar)</option>
                    <option value="Arrived">Arrived (Tiba di Pelabuhan Tujuan)</option>
                    <option value="Delayed">Delayed (Tertunda)</option>
                    <option value="Cancelled">Cancelled (Dibatalkan)</option>
                  </select>
                </div>

                {/* Pilih Kapal */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pilih Kapal Armada *</label>
                  <select
                    value={shipId}
                    onChange={(e) => setShipId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {ships.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.type} • {s.cargoCapacityTons} Ton)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pilih Rute */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pilih Jalur Rute *</label>
                  <select
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.originPort} ➔ {r.destinationPort}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Waktu Keberangkatan */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Waktu Berangkat (ETD) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Waktu Tiba */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Estimasi Tiba (ETA) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Muatan Terbooking Saat Ini */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Total Muatan Masuk (Ton)</label>
                  <input
                    type="number"
                    min="0"
                    value={bookedCargoTons}
                    onChange={(e) => setBookedCargoTons(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Penumpang Terbooking */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Total Penumpang Terdaftar (Pax)</label>
                  <input
                    type="number"
                    min="0"
                    value={bookedPassengers}
                    onChange={(e) => setBookedPassengers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
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
                  <span>{editingSchedule ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
