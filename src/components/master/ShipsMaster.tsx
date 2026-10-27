import React, { useState } from 'react';
import { 
  Ship, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Anchor, 
  X, 
  Check, 
  Gauge, 
  Users, 
  Package, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';
import { Ship as ShipModel, ShipStatus, ShipType } from '../../types';

interface ShipsMasterProps {
  ships: ShipModel[];
  onSaveShip: (ship: ShipModel) => Promise<void>;
  onDeleteShip: (shipId: string) => Promise<void>;
  isLoading: boolean;
}

export const ShipsMaster: React.FC<ShipsMasterProps> = ({
  ships,
  onSaveShip,
  onDeleteShip,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<ShipModel | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ShipType>('Ro-Ro Ferry');
  const [passengerCapacity, setPassengerCapacity] = useState(500);
  const [cargoCapacityTons, setCargoCapacityTons] = useState(1500);
  const [containerTeus, setContainerTeus] = useState(50);
  const [speedKnots, setSpeedKnots] = useState(16);
  const [status, setStatus] = useState<ShipStatus>('Active');
  const [captainName, setCaptainName] = useState('');
  const [yearBuilt, setYearBuilt] = useState(2022);

  const openAddModal = () => {
    setEditingShip(null);
    setName('');
    setCode(`ARS-${Math.floor(100 + Math.random() * 900)}`);
    setType('Ro-Ro Ferry');
    setPassengerCapacity(600);
    setCargoCapacityTons(2000);
    setContainerTeus(60);
    setSpeedKnots(17);
    setStatus('Active');
    setCaptainName('');
    setYearBuilt(2022);
    setIsModalOpen(true);
  };

  const openEditModal = (ship: ShipModel) => {
    setEditingShip(ship);
    setName(ship.name);
    setCode(ship.code);
    setType(ship.type);
    setPassengerCapacity(ship.passengerCapacity);
    setCargoCapacityTons(ship.cargoCapacityTons);
    setContainerTeus(ship.containerTeus || 0);
    setSpeedKnots(ship.speedKnots);
    setStatus(ship.status);
    setCaptainName(ship.captainName);
    setYearBuilt(ship.yearBuilt);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const shipData: ShipModel = {
      id: editingShip ? editingShip.id : `ship-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      passengerCapacity: Number(passengerCapacity),
      cargoCapacityTons: Number(cargoCapacityTons),
      containerTeus: Number(containerTeus),
      speedKnots: Number(speedKnots),
      status,
      captainName: captainName.trim() || 'Capt. On Duty',
      yearBuilt: Number(yearBuilt),
      createdAt: editingShip?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveShip(shipData);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await onDeleteShip(id);
    setDeletingId(null);
  };

  // Filtered List
  const filteredShips = ships.filter(ship => {
    const matchSearch = ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ship.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ship.captainName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || ship.status === filterStatus;
    const matchType = filterType === 'All' || ship.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <Anchor className="w-6 h-6 text-cyan-400" />
            <span>Master Data Kapal & Armada Laut</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manajemen spesifikasi kapal, kapasitas muatan tonase, kuota penumpang, dan sertifikasi nahkoda.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 text-sm border border-cyan-400/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kapal Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kapal, kode, nahkoda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Active (Siap Layar)</option>
            <option value="Sailing">Sailing (Berlayar)</option>
            <option value="Docked">Docked (Bersandar)</option>
            <option value="Maintenance">Maintenance (Docking)</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">Semua Tipe Kapal</option>
            <option value="Ro-Ro Ferry">Ro-Ro Ferry</option>
            <option value="Container Ship">Container Ship</option>
            <option value="Fast Passenger Boat">Fast Passenger Boat</option>
            <option value="General Cargo">General Cargo</option>
            <option value="Bulk Carrier">Bulk Carrier</option>
          </select>
        </div>

      </div>

      {/* Ships Table / Grid */}
      <div className="rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4">Nama Kapal & Kode</th>
                <th className="py-3.5 px-4">Tipe Armada</th>
                <th className="py-3.5 px-4 text-center">Kapasitas Muatan</th>
                <th className="py-3.5 px-4 text-center">Kecepatan</th>
                <th className="py-3.5 px-4">Nahkoda (Captain)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredShips.length > 0 ? (
                filteredShips.map((ship) => (
                  <tr key={ship.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Name & Code */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-base">{ship.name}</div>
                      <div className="text-xs font-mono text-cyan-400 mt-0.5">
                        {ship.code} • Tahun {ship.yearBuilt}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {ship.type}
                      </span>
                    </td>

                    {/* Capacity */}
                    <td className="py-4 px-4 text-center">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-200 font-semibold flex items-center justify-center space-x-1">
                          <Package className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{ship.cargoCapacityTons.toLocaleString()} Ton</span>
                          {ship.containerTeus > 0 && (
                            <span className="text-[11px] text-slate-400 font-normal">({ship.containerTeus} TEUs)</span>
                          )}
                        </div>
                        {ship.passengerCapacity > 0 && (
                          <div className="text-xs text-slate-400 flex items-center justify-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-violet-400" />
                            <span>{ship.passengerCapacity.toLocaleString()} Pax</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Speed */}
                    <td className="py-4 px-4 text-center font-semibold text-slate-300">
                      <div className="inline-flex items-center space-x-1 text-xs">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{ship.speedKnots} Knot</span>
                      </div>
                    </td>

                    {/* Captain */}
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-slate-200">{ship.captainName}</div>
                      <div className="text-[11px] text-slate-400">Master Mariner</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        ship.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ship.status === 'Sailing'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : ship.status === 'Docked'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        ● {ship.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(ship)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Kapal"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(ship.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hapus Kapal"
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
                    Tidak ada data kapal yang sesuai dengan filter pencarian.
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
            <h3 className="text-lg font-bold text-white">Konfirmasi Hapus Kapal</h3>
            <p className="text-sm text-slate-400">
              Apakah Anda yakin ingin menghapus data kapal ini dari database? Aksi ini akan menghapus data kapal secara permanen.
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

      {/* Add / Edit Ship Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingShip ? 'Edit Data Kapal' : 'Tambah Armada Kapal Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">Input spesifikasi teknis dan legalitas kapal</p>
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
                
                {/* Nama Kapal */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nama Kapal (KM.) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KM. ARS Samudera Express"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Kode Kapal */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Kode Registrasi Armada *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ARS-NX-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Tipe Kapal */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tipe Kapal *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ShipType)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Ro-Ro Ferry">Ro-Ro Ferry (Penumpang & Kendaraan)</option>
                    <option value="Container Ship">Container Ship (Kontainer Murni)</option>
                    <option value="Fast Passenger Boat">Fast Passenger Boat (Kapal Cepat)</option>
                    <option value="General Cargo">General Cargo (Kargo Umum / Pallet)</option>
                    <option value="Bulk Carrier">Bulk Carrier (Curah)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Operasional *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ShipStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Active">Active (Siap Berlayar)</option>
                    <option value="Sailing">Sailing (Sedang Dalam Pelayaran)</option>
                    <option value="Docked">Docked (Bersandar di Dermaga)</option>
                    <option value="Maintenance">Maintenance (Dalam Perbaikan/Dock)</option>
                  </select>
                </div>

                {/* Kapasitas Tonase */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Kapasitas Muatan (Ton) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={cargoCapacityTons}
                    onChange={(e) => setCargoCapacityTons(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Kapasitas Penumpang */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Kapasitas Penumpang (Orang)</label>
                  <input
                    type="number"
                    min="0"
                    value={passengerCapacity}
                    onChange={(e) => setPassengerCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Kapasitas Kontainer TEUs */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Slot Kontainer (TEUs)</label>
                  <input
                    type="number"
                    min="0"
                    value={containerTeus}
                    onChange={(e) => setContainerTeus(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Kecepatan Kapal */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Kecepatan Jelajah (Knot)</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={speedKnots}
                    onChange={(e) => setSpeedKnots(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Nama Nahkoda */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nahkoda (Captain)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Capt. Bambang, M.Mar"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Tahun Pembuatan */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tahun Pembuatan</label>
                  <input
                    type="number"
                    min="1980"
                    max="2030"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(Number(e.target.value))}
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
                  <span>{editingShip ? 'Simpan Perubahan' : 'Tambah Kapal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
