import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer, 
  Eye, 
  SlidersHorizontal, 
  Check, 
  X, 
  FileText, 
  ArrowRight, 
  Building2, 
  Truck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CargoShipment, Schedule, Route, CargoType, ShipmentStatus, PaymentStatus } from '../../types';

interface CargoTransactionsProps {
  cargoList: CargoShipment[];
  schedules: Schedule[];
  routes: Route[];
  onSaveCargo: (cargo: CargoShipment) => Promise<void>;
  onDeleteCargo: (cargoId: string) => Promise<void>;
  onPrintBL: (cargo: CargoShipment) => void;
  isLoading: boolean;
}

export const CargoTransactions: React.FC<CargoTransactionsProps> = ({
  cargoList,
  schedules,
  routes,
  onSaveCargo,
  onDeleteCargo,
  onPrintBL,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPayment, setFilterPayment] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<CargoShipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [scheduleId, setScheduleId] = useState(schedules[0]?.id || '');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [cargoType, setCargoType] = useState<CargoType>('Dry Container 20ft');
  const [weightTons, setWeightTons] = useState(15);
  const [volumeM3, setVolumeM3] = useState(33);
  const [containerOrPlateNumber, setContainerOrPlateNumber] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [handlingInstructions, setHandlingInstructions] = useState('');
  const [shippingFee, setShippingFee] = useState(8500000);
  const [insuranceFee, setInsuranceFee] = useState(150000);
  const [portFee, setPortFee] = useState(250000);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>('Booking');

  const openAddModal = () => {
    setEditingCargo(null);
    setScheduleId(schedules[0]?.id || '');
    setSenderName('');
    setSenderPhone('');
    setSenderAddress('');
    setReceiverName('');
    setReceiverPhone('');
    setReceiverAddress('');
    setCargoType('Dry Container 20ft');
    setWeightTons(18);
    setVolumeM3(33);
    setContainerOrPlateNumber(`ARSU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1 + Math.random() * 9)}`);
    setCargoDescription('Material Industri & Barang Manufaktur Standar');
    setHandlingInstructions('Lashing kuat, ganjal dek kapal saat pelayaran');
    setShippingFee(9500000);
    setInsuranceFee(200000);
    setPortFee(250000);
    setPaymentStatus('Paid');
    setShipmentStatus('Booking');
    setIsModalOpen(true);
  };

  const openEditModal = (item: CargoShipment) => {
    setEditingCargo(item);
    setScheduleId(item.scheduleId);
    setSenderName(item.senderName);
    setSenderPhone(item.senderPhone);
    setSenderAddress(item.senderAddress || '');
    setReceiverName(item.receiverName);
    setReceiverPhone(item.receiverPhone);
    setReceiverAddress(item.receiverAddress || '');
    setCargoType(item.cargoType);
    setWeightTons(item.weightTons);
    setVolumeM3(item.volumeM3 || 0);
    setContainerOrPlateNumber(item.containerOrPlateNumber || '');
    setCargoDescription(item.cargoDescription);
    setHandlingInstructions(item.handlingInstructions || '');
    setShippingFee(item.shippingFee);
    setInsuranceFee(item.insuranceFee);
    setPortFee(item.portFee);
    setPaymentStatus(item.paymentStatus);
    setShipmentStatus(item.shipmentStatus);
    setIsModalOpen(true);
  };

  // Auto fee calculation when schedule, weight, or cargo type changes
  const handleRecalculateFee = (schedId: string, type: CargoType, weight: number) => {
    const selectedSched = schedules.find(s => s.id === schedId);
    if (!selectedSched) return;
    const relatedRoute = routes.find(r => r.id === selectedSched.routeId) || routes[0];
    const baseRate = relatedRoute ? relatedRoute.baseCargoRatePerTon : 500000;
    
    let multiplier = 1.0;
    if (type === 'Dry Container 20ft') multiplier = 1.2;
    else if (type === 'Dry Container 40ft') multiplier = 2.1;
    else if (type === 'Reefer Cold Container') multiplier = 1.8;
    else if (type === 'Heavy Equipment / Truk') multiplier = 1.5;
    else if (type === 'Vehicles / Kendaraan') multiplier = 1.3;
    else if (type === 'Liquid / Bulk') multiplier = 0.9;

    const computedShipping = Math.round(baseRate * weight * multiplier);
    const computedInsurance = Math.round(computedShipping * 0.006);
    const computedPort = 250000;

    setShippingFee(computedShipping);
    setInsuranceFee(computedInsurance);
    setPortFee(computedPort);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !receiverName.trim()) return;

    const selectedSched = schedules.find(s => s.id === scheduleId) || schedules[0];
    const totalAmount = Number(shippingFee) + Number(insuranceFee) + Number(portFee);

    const cargoData: CargoShipment = {
      id: editingCargo ? editingCargo.id : `cargo-${Date.now()}`,
      billOfLadingNumber: editingCargo?.billOfLadingNumber || `BL-ARS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      scheduleId,
      shipName: selectedSched?.shipName || 'KM. ARS Nusantara',
      voyageNumber: selectedSched?.voyageNumber || 'VOY-ARS-2026',
      originPort: selectedSched?.originPort || 'Pelabuhan Tanjung Priok (Jakarta)',
      destinationPort: selectedSched?.destinationPort || 'Pelabuhan Tanjung Perak (Surabaya)',
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim(),
      senderAddress: senderAddress.trim(),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      receiverAddress: receiverAddress.trim(),
      cargoType,
      weightTons: Number(weightTons),
      volumeM3: Number(volumeM3),
      containerOrPlateNumber: containerOrPlateNumber.trim(),
      cargoDescription: cargoDescription.trim(),
      handlingInstructions: handlingInstructions.trim(),
      shippingFee: Number(shippingFee),
      insuranceFee: Number(insuranceFee),
      portFee: Number(portFee),
      totalAmount,
      paymentStatus,
      shipmentStatus,
      createdAt: editingCargo?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveCargo(cargoData);
    setIsModalOpen(false);
  };

  const handleQuickStatusChange = async (item: CargoShipment, newStatus: ShipmentStatus) => {
    const updated = { ...item, shipmentStatus: newStatus, updatedAt: new Date().toISOString() };
    await onSaveCargo(updated);
  };

  const handleDelete = async (id: string) => {
    await onDeleteCargo(id);
    setDeletingId(null);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredCargo = cargoList.filter(item => {
    const matchSearch = item.billOfLadingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.containerOrPlateNumber && item.containerOrPlateNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        item.shipName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || item.shipmentStatus === filterStatus;
    const matchPayment = filterPayment === 'All' || item.paymentStatus === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <Package className="w-6 h-6 text-cyan-400" />
            <span>Transaksi Muatan Kapal & Bill of Lading (B/L)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pencatatan manifes kargo, kontainer, pelayaran antar-pulau, penagihan freight, dan cetak Surat Muatan Resmi.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 text-sm border border-cyan-400/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Resi / B/L Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No B/L, pengirim, penerima, kontainer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

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
            <option value="All">Semua Status Muatan</option>
            <option value="Booking">Booking (Pemesanan)</option>
            <option value="Manifested">Manifested (Terdaftar)</option>
            <option value="Loaded">Loaded (Sudah di Kapal)</option>
            <option value="In Transit">In Transit (Berlayar)</option>
            <option value="Discharged">Discharged (Bongkar)</option>
            <option value="Delivered">Delivered (Selesai Terima)</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">Semua Status Bayar</option>
            <option value="Paid">Lunas (Paid)</option>
            <option value="Pending">Menunggu Pembayaran</option>
            <option value="Unpaid">Belum Dibayar</option>
          </select>
        </div>
      </div>

      {/* Cargo Shipments Table */}
      <div className="rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4">No. Bill of Lading (B/L)</th>
                <th className="py-3.5 px-4">Pelayaran & Rute</th>
                <th className="py-3.5 px-4">Pengirim & Penerima</th>
                <th className="py-3.5 px-4">Spesifikasi Kargo</th>
                <th className="py-3.5 px-4">Total Tagihan</th>
                <th className="py-3.5 px-4 text-center">Status Muatan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCargo.length > 0 ? (
                filteredCargo.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* B/L Number */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-white text-sm text-cyan-300">
                        {item.billOfLadingNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.paymentStatus}
                      </span>
                    </td>

                    {/* Voyage & Route */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white text-xs">{item.shipName}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">{item.voyageNumber}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {item.originPort} ➔ {item.destinationPort}
                      </div>
                    </td>

                    {/* Sender & Receiver */}
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <span className="text-slate-400">Dari: </span>
                        <strong className="text-slate-200">{item.senderName}</strong>
                      </div>
                      <div className="text-xs mt-0.5">
                        <span className="text-slate-400">Kepada: </span>
                        <strong className="text-slate-200">{item.receiverName}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Telp: {item.senderPhone}
                      </div>
                    </td>

                    {/* Cargo Specs */}
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-slate-200">{item.cargoType}</div>
                      <div className="text-xs text-slate-400">
                        {item.weightTons} Ton • {item.containerOrPlateNumber || 'Non-Container'}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={item.cargoDescription}>
                        {item.cargoDescription}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-bold text-slate-100 text-sm">
                      {formatRupiah(item.totalAmount)}
                    </td>

                    {/* Quick Status Select */}
                    <td className="py-4 px-4 text-center">
                      <select
                        value={item.shipmentStatus}
                        onChange={(e) => handleQuickStatusChange(item, e.target.value as ShipmentStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                          item.shipmentStatus === 'In Transit'
                            ? 'bg-blue-950/60 text-blue-400 border-blue-500/40'
                            : item.shipmentStatus === 'Loaded'
                              ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40'
                              : item.shipmentStatus === 'Delivered'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="Booking">Booking</option>
                        <option value="Manifested">Manifested</option>
                        <option value="Loaded">Loaded</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Discharged">Discharged</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onPrintBL(item)}
                          className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-600/30 rounded-lg transition-colors"
                          title="Cetak Surat Muatan B/L"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Transaksi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hapus Transaksi"
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
                    Tidak ada transaksi muatan kargo yang ditemukan.
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
            <h3 className="text-lg font-bold text-white">Konfirmasi Hapus Transaksi Kargo</h3>
            <p className="text-sm text-slate-400">
              Apakah Anda yakin ingin menghapus data manifes muatan kapal ini?
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

      {/* Add / Edit Cargo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingCargo ? 'Edit Data Muatan Kapal (B/L)' : 'Input Transaksi Muatan Baru (Bill of Lading)'}
                  </h3>
                  <p className="text-xs text-slate-400">Lengkapi data shipper, consignee, kargo, dan jadwal pelayaran</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Schedule Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Pilih Jadwal Pelayaran & Kapal *</label>
                <select
                  value={scheduleId}
                  onChange={(e) => {
                    setScheduleId(e.target.value);
                    handleRecalculateFee(e.target.value, cargoType, weightTons);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {schedules.map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.voyageNumber} - {sc.shipName} ({sc.originPort} ➔ {sc.destinationPort})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipper & Consignee Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                
                {/* Shipper */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>DATA PENGIRIM (SHIPPER)</span>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Nama Perusahaan / Perorangan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT. Wijaya Logistik"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">No. Telepon / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="0812-xxxx-xxxx"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Alamat Pengirim</label>
                    <input
                      type="text"
                      placeholder="Alamat asal pengirim..."
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Consignee */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>DATA PENERIMA (CONSIGNEE)</span>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Nama Perusahaan / Penerima *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT. Distributor Sejahtera"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">No. Telepon Penerima *</label>
                    <input
                      type="text"
                      required
                      placeholder="0813-xxxx-xxxx"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Alamat Penerima</label>
                    <input
                      type="text"
                      placeholder="Alamat tujuan penerima..."
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

              </div>

              {/* Cargo Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Jenis Kargo */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Jenis Kargo / Boks *</label>
                  <select
                    value={cargoType}
                    onChange={(e) => {
                      const newType = e.target.value as CargoType;
                      setCargoType(newType);
                      handleRecalculateFee(scheduleId, newType, weightTons);
                    }}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Dry Container 20ft">Dry Container 20ft</option>
                    <option value="Dry Container 40ft">Dry Container 40ft</option>
                    <option value="Reefer Cold Container">Reefer Cold Container</option>
                    <option value="General Cargo (Pallet)">General Cargo (Pallet)</option>
                    <option value="Heavy Equipment / Truk">Heavy Equipment / Truk</option>
                    <option value="Vehicles / Kendaraan">Vehicles / Kendaraan</option>
                    <option value="Liquid / Bulk">Liquid / Bulk</option>
                  </select>
                </div>

                {/* Berat Muatan */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Berat Muatan (Ton) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightTons}
                    onChange={(e) => {
                      const newWeight = Number(e.target.value);
                      setWeightTons(newWeight);
                      handleRecalculateFee(scheduleId, cargoType, newWeight);
                    }}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Nomor Kontainer / No Polisi */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">No. Kontainer / Plat Nomor</label>
                  <input
                    type="text"
                    placeholder="Contoh: ARSU-981240-1"
                    value={containerOrPlateNumber}
                    onChange={(e) => setContainerOrPlateNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

              </div>

              {/* Deskripsi Barang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Deskripsi Barang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 15 Pallet Material Besi Beton"
                    value={cargoDescription}
                    onChange={(e) => setCargoDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Instruksi Khusus Penanganan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tutup terpal, hindari air laut"
                    value={handlingInstructions}
                    onChange={(e) => setHandlingInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Fee Breakdown & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Ongkos Angkut (IDR)</label>
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Asuransi (IDR)</label>
                  <input
                    type="number"
                    value={insuranceFee}
                    onChange={(e) => setInsuranceFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Pas Pelabuhan (IDR)</label>
                  <input
                    type="number"
                    value={portFee}
                    onChange={(e) => setPortFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold text-cyan-400">Total Tagihan (IDR)</label>
                  <div className="px-3 py-2 bg-cyan-950/40 border border-cyan-800 rounded-lg text-sm font-bold text-cyan-300">
                    {formatRupiah(Number(shippingFee) + Number(insuranceFee) + Number(portFee))}
                  </div>
                </div>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Paid">Lunas (Paid)</option>
                    <option value="Pending">Menunggu Pembayaran</option>
                    <option value="Unpaid">Belum Dibayar</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Pengiriman</label>
                  <select
                    value={shipmentStatus}
                    onChange={(e) => setShipmentStatus(e.target.value as ShipmentStatus)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Booking">Booking</option>
                    <option value="Manifested">Manifested</option>
                    <option value="Loaded">Loaded (Di Kapal)</option>
                    <option value="In Transit">In Transit (Berlayar)</option>
                    <option value="Discharged">Discharged (Bongkar)</option>
                    <option value="Delivered">Delivered (Selesai)</option>
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
                  <span>{editingCargo ? 'Simpan Perubahan' : 'Terbitkan B/L'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
