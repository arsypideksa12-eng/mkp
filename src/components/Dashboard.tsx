import React from 'react';
import { 
  Ship, 
  Package, 
  Ticket, 
  TrendingUp, 
  Anchor, 
  PlusCircle, 
  ArrowUpRight, 
  Clock, 
  Navigation, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { Ship as ShipModel, Route, Schedule, CargoShipment, PassengerTicket } from '../types';

interface DashboardProps {
  ships: ShipModel[];
  routes: Route[];
  schedules: Schedule[];
  cargo: CargoShipment[];
  tickets: PassengerTicket[];
  onSelectView: (view: string) => void;
  onOpenNewCargo: () => void;
  onOpenNewTicket: () => void;
  onViewCargoDetail: (cargo: CargoShipment) => void;
  onViewTicketDetail: (ticket: PassengerTicket) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  ships,
  routes,
  schedules,
  cargo,
  tickets,
  onSelectView,
  onOpenNewCargo,
  onOpenNewTicket,
  onViewCargoDetail,
  onViewTicketDetail
}) => {
  // Calculations
  const totalCargoRevenue = cargo
    .filter(c => c.paymentStatus === 'Paid')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const totalTicketRevenue = tickets
    .filter(t => t.paymentStatus === 'Paid')
    .reduce((acc, curr) => acc + (curr.totalFare || 0), 0);

  const grandTotalRevenue = totalCargoRevenue + totalTicketRevenue;

  const totalCargoWeight = cargo.reduce((acc, curr) => acc + (curr.weightTons || 0), 0);
  const activeSchedules = schedules.filter(s => s.status === 'Sailing' || s.status === 'Boarding' || s.status === 'Scheduled');
  const activeShips = ships.filter(s => s.status === 'Active' || s.status === 'Sailing');

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome & Quick Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-700/80 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sistem Manajemen Pelayaran & Ekspedisi Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              ARS LOGISTIC & PASSENGER SERVICE
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Monitoring logistik kontainer kargo, manifes muatan pelabuhan, dan reservasi tiket penumpang seluruh armada laut nusantara secara real-time.
            </p>
          </div>

          {/* Fast Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onOpenNewCargo}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-4 py-3 rounded-xl shadow-lg shadow-cyan-600/25 transition-all transform active:scale-95 text-sm border border-cyan-400/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Muatan Kargo (B/L)</span>
            </button>
            <button
              onClick={onOpenNewTicket}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-4 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 text-sm border border-indigo-400/40"
            >
              <Ticket className="w-4 h-4" />
              <span>+ Tiket Penumpang</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Total Pendapatan Gabungan */}
        <div className="p-5 rounded-2xl bg-slate-850/90 border border-slate-700/70 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Omzet / Pendapatan
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatRupiah(grandTotalRevenue)}
            </div>
            <div className="mt-1 flex items-center space-x-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                Live Cloud Sync
              </span>
              <span>• Kargo & Penumpang</span>
            </div>
          </div>
        </div>

        {/* Total Muatan Kargo */}
        <div className="p-5 rounded-2xl bg-slate-850/90 border border-slate-700/70 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Muatan Kargo & Kontainer
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {totalCargoWeight.toLocaleString('id-ID')} <span className="text-base font-normal text-slate-400">Ton</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
              <span>{cargo.length} Transaksi Bill of Lading</span>
              <span className="text-cyan-400 font-medium">{formatRupiah(totalCargoRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Total Penumpang */}
        <div className="p-5 rounded-2xl bg-slate-850/90 border border-slate-700/70 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Penumpang Terdaftar
            </span>
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {tickets.length} <span className="text-base font-normal text-slate-400">Orang</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
              <span>Tiket Boarding Aktif</span>
              <span className="text-violet-400 font-medium">{formatRupiah(totalTicketRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Armada Berlayar */}
        <div className="p-5 rounded-2xl bg-slate-850/90 border border-slate-700/70 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Armada & Jadwal Aktif
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {activeShips.length} <span className="text-base font-normal text-slate-400">/ {ships.length} Kapal</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
              <span>{activeSchedules.length} Pelayaran Aktif</span>
              <span className="text-blue-400 font-medium">{routes.length} Rute Laut</span>
            </div>
          </div>
        </div>

      </div>

      {/* Fleet Live Status & Active Voyages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Active Voyages Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Status Pelayaran & Voyage Berjalan</h2>
            </div>
            <button
              onClick={() => onSelectView('trans_schedules')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Semua Jadwal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {schedules.slice(0, 3).map((sched) => (
              <div
                key={sched.id}
                className="p-5 rounded-2xl bg-slate-850/80 border border-slate-700/70 hover:border-slate-600 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base">{sched.shipName}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
                        {sched.voyageNumber}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span className="text-slate-300">{sched.originPort}</span>
                      <span className="text-cyan-400 font-bold">➔</span>
                      <span className="text-slate-300">{sched.destinationPort}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      sched.status === 'Sailing' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : sched.status === 'Boarding'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      ● {sched.status === 'Sailing' ? 'Sedang Berlayar' : sched.status === 'Boarding' ? 'Proses Muat / Boarding' : sched.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>ETD: {new Date(sched.departureTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Muatan: <strong className="text-slate-200">{sched.bookedCargoTons} Ton</strong></span>
                    <span>Penumpang: <strong className="text-slate-200">{sched.bookedPassengers} Orang</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Fleet Health & Quick Master Shortcut */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ship className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Armada Kapal</h2>
            </div>
            <button
              onClick={() => onSelectView('master_ships')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Kelola Kapal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-850/80 border border-slate-700/70 space-y-4 shadow-md">
            {ships.slice(0, 4).map((ship) => (
              <div key={ship.id} className="flex items-center justify-between py-2 border-b border-slate-800/80 last:border-b-0">
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm text-slate-200">{ship.name}</div>
                  <div className="text-xs text-slate-400">{ship.type} • {ship.speedKnots} Knots</div>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    ship.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : ship.status === 'Sailing'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : ship.status === 'Docked'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {ship.status}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {ship.cargoCapacityTons.toLocaleString()} Ton
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real Database Badge Box */}
          <div 
            onClick={() => onSelectView('database_sync')}
            className="cursor-pointer p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 hover:border-cyan-400/60 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Konektivitas Database Multi-Platform</span>
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Terkoneksi ke Firebase Firestore secara real-time. Tersedia modul export skema DDL & SQL untuk Supabase & Neon DB.
            </p>
          </div>

        </div>

      </div>

      {/* Recent Cargo & Passenger Activity Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Cargo Bookings (B/L) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Muatan Kargo Terkini (B/L)</h2>
            </div>
            <button
              onClick={() => onSelectView('trans_cargo')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {cargo.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onViewCargoDetail(item)}
                className="p-4 rounded-2xl bg-slate-850/70 border border-slate-700/60 hover:border-cyan-500/50 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {item.billOfLadingNumber}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Pengirim: <span className="text-slate-300 font-medium">{item.senderName}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.shipmentStatus === 'In Transit'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : item.shipmentStatus === 'Loaded'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.shipmentStatus}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>{item.cargoType} • {item.weightTons} Ton</span>
                  <span className="font-bold text-slate-200">{formatRupiah(item.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Passenger Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Tiket Penumpang Terkini</h2>
            </div>
            <button
              onClick={() => onSelectView('trans_passengers')}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {tickets.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onViewTicketDetail(item)}
                className="p-4 rounded-2xl bg-slate-850/70 border border-slate-700/60 hover:border-violet-500/50 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors">
                      {item.ticketNumber}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Penumpang: <span className="text-slate-300 font-medium">{item.passengerName}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.boardingStatus === 'Checked-in'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {item.boardingStatus}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>{item.passengerClass} • {item.seatOrCabinNumber}</span>
                  <span className="font-bold text-slate-200">{formatRupiah(item.totalFare)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
