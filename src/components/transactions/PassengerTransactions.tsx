import React, { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer, 
  SlidersHorizontal, 
  Check, 
  X, 
  UserCheck, 
  CreditCard,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { PassengerTicket, Schedule, Route, PassengerClass, BoardingStatus, PaymentStatus } from '../../types';

interface PassengerTransactionsProps {
  tickets: PassengerTicket[];
  schedules: Schedule[];
  routes: Route[];
  onSaveTicket: (ticket: PassengerTicket) => Promise<void>;
  onDeleteTicket: (ticketId: string) => Promise<void>;
  onPrintTicket: (ticket: PassengerTicket) => void;
  isLoading: boolean;
}

export const PassengerTransactions: React.FC<PassengerTransactionsProps> = ({
  tickets,
  schedules,
  routes,
  onSaveTicket,
  onDeleteTicket,
  onPrintTicket,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<PassengerTicket | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [scheduleId, setScheduleId] = useState(schedules[0]?.id || '');
  const [passengerName, setPassengerName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [phone, setPhone] = useState('');
  const [passengerClass, setPassengerClass] = useState<PassengerClass>('Bisnis AC');
  const [seatOrCabinNumber, setSeatOrCabinNumber] = useState('B-12');
  const [fareAmount, setFareAmount] = useState(420000);
  const [insuranceFee, setInsuranceFee] = useState(20000);
  const [portServiceFee, setPortServiceFee] = useState(15000);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [boardingStatus, setBoardingStatus] = useState<BoardingStatus>('Booked');

  const openAddModal = () => {
    setEditingTicket(null);
    setScheduleId(schedules[0]?.id || '');
    setPassengerName('');
    setIdentityNumber('317' + Math.floor(1000000000000 + Math.random() * 9000000000000));
    setGender('Laki-laki');
    setPhone('');
    setPassengerClass('Bisnis AC');
    setSeatOrCabinNumber(`B-${Math.floor(10 + Math.random() * 80)}`);
    setPaymentStatus('Paid');
    setBoardingStatus('Booked');

    // Initial pricing calculation
    calculateTicketPrice(schedules[0]?.id || '', 'Bisnis AC');
    setIsModalOpen(true);
  };

  const openEditModal = (t: PassengerTicket) => {
    setEditingTicket(t);
    setScheduleId(t.scheduleId);
    setPassengerName(t.passengerName);
    setIdentityNumber(t.identityNumber);
    setGender(t.gender);
    setPhone(t.phone);
    setPassengerClass(t.passengerClass);
    setSeatOrCabinNumber(t.seatOrCabinNumber);
    setFareAmount(t.fareAmount);
    setInsuranceFee(t.insuranceFee);
    setPortServiceFee(t.portServiceFee);
    setPaymentStatus(t.paymentStatus);
    setBoardingStatus(t.boardingStatus);
    setIsModalOpen(true);
  };

  const calculateTicketPrice = (schedId: string, pClass: PassengerClass) => {
    const selectedSched = schedules.find(s => s.id === schedId);
    if (!selectedSched) return;
    const relatedRoute = routes.find(r => r.id === selectedSched.routeId) || routes[0];
    const baseFare = relatedRoute ? relatedRoute.basePassengerFare : 300000;

    let multiplier = 1.0;
    if (pClass === 'VIP Cabin') multiplier = 2.3;
    else if (pClass === 'Kelas 1') multiplier = 1.7;
    else if (pClass === 'Bisnis AC') multiplier = 1.35;
    else if (pClass === 'Ekonomi Dek') multiplier = 1.0;

    const computedFare = Math.round(baseFare * multiplier);
    setFareAmount(computedFare);
    setInsuranceFee(20000);
    setPortServiceFee(15000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim() || !identityNumber.trim()) return;

    const selectedSched = schedules.find(s => s.id === scheduleId) || schedules[0];
    const totalFare = Number(fareAmount) + Number(insuranceFee) + Number(portServiceFee);

    const ticketData: PassengerTicket = {
      id: editingTicket ? editingTicket.id : `tkt-${Date.now()}`,
      ticketNumber: editingTicket?.ticketNumber || `TKT-ARS-${Math.floor(10000 + Math.random() * 90000)}`,
      scheduleId,
      shipName: selectedSched?.shipName || 'KM. ARS Nusantara Express',
      voyageNumber: selectedSched?.voyageNumber || 'VOY-ARS-2026',
      originPort: selectedSched?.originPort || 'Pelabuhan Tanjung Priok (Jakarta)',
      destinationPort: selectedSched?.destinationPort || 'Pelabuhan Tanjung Perak (Surabaya)',
      departureTime: selectedSched?.departureTime || new Date().toISOString(),
      passengerName: passengerName.trim(),
      identityNumber: identityNumber.trim(),
      gender,
      phone: phone.trim() || '0812-0000-0000',
      passengerClass,
      seatOrCabinNumber: seatOrCabinNumber.trim() || 'Ekonomi Dek',
      fareAmount: Number(fareAmount),
      insuranceFee: Number(insuranceFee),
      portServiceFee: Number(portServiceFee),
      totalFare,
      paymentStatus,
      boardingStatus,
      createdAt: editingTicket?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveTicket(ticketData);
    setIsModalOpen(false);
  };

  const handleQuickBoardingStatus = async (item: PassengerTicket, newStatus: BoardingStatus) => {
    const updated = { ...item, boardingStatus: newStatus, updatedAt: new Date().toISOString() };
    await onSaveTicket(updated);
  };

  const handleDelete = async (id: string) => {
    await onDeleteTicket(id);
    setDeletingId(null);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.identityNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.shipName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass === 'All' || t.passengerClass === filterClass;
    const matchStatus = filterStatus === 'All' || t.boardingStatus === filterStatus;
    return matchSearch && matchClass && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <Ticket className="w-6 h-6 text-violet-400" />
            <span>Transaksi Tiket Penumpang & Boarding Pass</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reservasi tiket pelayaran, alokasi kabin & kursi, verifikasi NIK/identitas, dan cetak boarding pass resmi ber-QR Code.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-violet-600/20 text-sm border border-violet-400/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Booking Tiket Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No Tiket, nama penumpang, NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400"
          >
            <option value="All">Semua Kelas</option>
            <option value="VIP Cabin">VIP Cabin</option>
            <option value="Kelas 1">Kelas 1</option>
            <option value="Bisnis AC">Bisnis AC</option>
            <option value="Ekonomi Dek">Ekonomi Dek</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400"
          >
            <option value="All">Semua Status Boarding</option>
            <option value="Booked">Booked (Terkonfirmasi)</option>
            <option value="Checked-in">Checked-in (Check-in Pelabuhan)</option>
            <option value="Boarded">Boarded (Di Atas Kapal)</option>
            <option value="Completed">Completed (Tiba)</option>
            <option value="Cancelled">Cancelled (Batal)</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4">No. Tiket & Tanggal</th>
                <th className="py-3.5 px-4">Nama Penumpang & NIK</th>
                <th className="py-3.5 px-4">Kapal & Pelayaran</th>
                <th className="py-3.5 px-4">Kelas & No. Kabin</th>
                <th className="py-3.5 px-4">Total Tarif</th>
                <th className="py-3.5 px-4 text-center">Status Boarding</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Ticket Number */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-violet-300 text-sm">
                        {t.ticketNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </div>
                    </td>

                    {/* Passenger Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{t.passengerName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        NIK: <span className="font-mono text-slate-300">{t.identityNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.gender} • {t.phone}
                      </div>
                    </td>

                    {/* Ship & Voyage */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white text-xs">{t.shipName}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">{t.voyageNumber}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.originPort} ➔ {t.destinationPort}
                      </div>
                    </td>

                    {/* Class & Seat */}
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        t.passengerClass === 'VIP Cabin'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : t.passengerClass === 'Kelas 1'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                      }`}>
                        {t.passengerClass}
                      </span>
                      <div className="text-xs text-slate-200 font-bold mt-1">
                        Kabin: {t.seatOrCabinNumber}
                      </div>
                    </td>

                    {/* Total Fare */}
                    <td className="py-4 px-4 font-bold text-slate-100 text-sm">
                      {formatRupiah(t.totalFare)}
                      <span className="block text-[10px] text-emerald-400 font-normal">Lunas (Paid)</span>
                    </td>

                    {/* Quick Boarding Status Select */}
                    <td className="py-4 px-4 text-center">
                      <select
                        value={t.boardingStatus}
                        onChange={(e) => handleQuickBoardingStatus(t, e.target.value as BoardingStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                          t.boardingStatus === 'Checked-in'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                            : t.boardingStatus === 'Boarded'
                              ? 'bg-blue-950/60 text-blue-400 border-blue-500/40'
                              : t.boardingStatus === 'Booked'
                                ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="Booked">Booked</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="Boarded">Boarded</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onPrintTicket(t)}
                          className="p-1.5 text-violet-400 hover:text-white hover:bg-violet-600/30 rounded-lg transition-colors"
                          title="Cetak E-Ticket / Boarding Pass"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Tiket"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hapus Tiket"
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
                    Tidak ada tiket penumpang yang ditemukan.
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
            <h3 className="text-lg font-bold text-white">Batalkan & Hapus Tiket</h3>
            <p className="text-sm text-slate-400">
              Apakah Anda yakin ingin membatalkan dan menghapus data tiket penumpang ini dari sistem?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Kembali
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Ya, Batalkan & Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingTicket ? 'Edit Tiket Penumpang' : 'Booking Tiket Kapal Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">Pendaftaran identitas manifest penumpang resmi syahbandar</p>
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
              
              {/* Schedule Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Pilih Jadwal Pelayaran *</label>
                <select
                  value={scheduleId}
                  onChange={(e) => {
                    setScheduleId(e.target.value);
                    calculateTicketPrice(e.target.value, passengerClass);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400"
                >
                  {schedules.map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.voyageNumber} - {sc.shipName} ({sc.originPort} ➔ {sc.destinationPort})
                    </option>
                  ))}
                </select>
              </div>

              {/* Passenger Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nama Lengkap */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nama Lengkap (Sesuai KTP/Paspor) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ir. Budi Santoso"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400"
                  />
                </div>

                {/* NIK / Identitas */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nomor Induk Kependudukan (NIK) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="16 digit NIK..."
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-violet-400"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* No Telepon */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400"
                  />
                </div>

                {/* Kelas Penumpang */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Kelas Tiket Penumpang *</label>
                  <select
                    value={passengerClass}
                    onChange={(e) => {
                      const newClass = e.target.value as PassengerClass;
                      setPassengerClass(newClass);
                      calculateTicketPrice(scheduleId, newClass);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="VIP Cabin">VIP Cabin (Privat Luxury)</option>
                    <option value="Kelas 1">Kelas 1 (Kabin 4 Bed)</option>
                    <option value="Bisnis AC">Bisnis AC (Kursi Reclining)</option>
                    <option value="Ekonomi Dek">Ekonomi Dek</option>
                  </select>
                </div>

                {/* Nomor Kursi / Kabin */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nomor Kursi / Kamar Kabin</label>
                  <input
                    type="text"
                    placeholder="Contoh: VIP-03 atau B-14"
                    value={seatOrCabinNumber}
                    onChange={(e) => setSeatOrCabinNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-violet-400"
                  />
                </div>

              </div>

              {/* Price Details */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Tarif Dasar Tiket:</span>
                  <span className="text-slate-200">{formatRupiah(fareAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Asuransi Jasa Raharja:</span>
                  <span className="text-slate-200">{formatRupiah(insuranceFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Pas Masuk Pelabuhan:</span>
                  <span className="text-slate-200">{formatRupiah(portServiceFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-violet-300 pt-2 border-t border-slate-800">
                  <span>Total Tagihan Tiket:</span>
                  <span>{formatRupiah(Number(fareAmount) + Number(insuranceFee) + Number(portServiceFee))}</span>
                </div>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="Paid">Lunas (Paid)</option>
                    <option value="Unpaid">Belum Bayar</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Boarding</label>
                  <select
                    value={boardingStatus}
                    onChange={(e) => setBoardingStatus(e.target.value as BoardingStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="Booked">Booked (Terkonfirmasi)</option>
                    <option value="Checked-in">Checked-in (Check-in Pelabuhan)</option>
                    <option value="Boarded">Boarded (Di Atas Kapal)</option>
                    <option value="Completed">Completed (Tiba di Tujuan)</option>
                    <option value="Cancelled">Cancelled (Dibatalkan)</option>
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
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-violet-600/30 border border-violet-400/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTicket ? 'Simpan Tiket' : 'Konfirmasi Tiket'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
