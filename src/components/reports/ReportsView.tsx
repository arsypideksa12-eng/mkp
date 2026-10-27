import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Ship, 
  Package, 
  Ticket, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  FileText,
  Anchor,
  Filter
} from 'lucide-react';
import { Ship as ShipModel, Route, Schedule, CargoShipment, PassengerTicket } from '../../types';
import { downloadFile } from '../../services/databaseExporter';

interface ReportsViewProps {
  ships: ShipModel[];
  routes: Route[];
  schedules: Schedule[];
  cargo: CargoShipment[];
  tickets: PassengerTicket[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  ships,
  routes,
  schedules,
  cargo,
  tickets
}) => {
  const [reportTab, setReportTab] = useState<'financial' | 'manifest' | 'utilization'>('financial');
  const [selectedVoyageId, setSelectedVoyageId] = useState(schedules[0]?.id || '');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'quarter'>('all');

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Financial Metrics
  const paidCargo = cargo.filter(c => c.paymentStatus === 'Paid');
  const paidTickets = tickets.filter(t => t.paymentStatus === 'Paid');

  const totalCargoIncome = paidCargo.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalTicketIncome = paidTickets.reduce((acc, curr) => acc + (curr.totalFare || 0), 0);
  const totalGrossIncome = totalCargoIncome + totalTicketIncome;
  const totalCargoTons = cargo.reduce((acc, curr) => acc + (curr.weightTons || 0), 0);

  // Selected Voyage for Manifest
  const selectedSchedule = schedules.find(s => s.id === selectedVoyageId) || schedules[0];
  const manifestCargo = cargo.filter(c => c.scheduleId === selectedSchedule?.id);
  const manifestTickets = tickets.filter(t => t.scheduleId === selectedSchedule?.id);

  // Export to CSV
  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportTab === 'financial') {
      csvContent += "Tipe Transaksi,Nomor Dokumen,Jadwal / Kapal,Nama Pelanggan,Tanggal,Total (IDR),Status Bayar\n";
      cargo.forEach(c => {
        csvContent += `"Kargo / B/L","${c.billOfLadingNumber}","${c.shipName} (${c.voyageNumber})","${c.senderName}","${c.createdAt.slice(0, 10)}",${c.totalAmount},"${c.paymentStatus}"\n`;
      });
      tickets.forEach(t => {
        csvContent += `"Tiket Penumpang","${t.ticketNumber}","${t.shipName} (${t.voyageNumber})","${t.passengerName}","${t.createdAt.slice(0, 10)}",${t.totalFare},"${t.paymentStatus}"\n`;
      });
      downloadFile(csvContent, `Laporan-Keuangan-ARS-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    } else {
      csvContent += "Manifes Keberangkatan Pelayaran ARS\n";
      csvContent += `Voyage: ${selectedSchedule?.voyageNumber}, Kapal: ${selectedSchedule?.shipName}\n`;
      csvContent += `Rute: ${selectedSchedule?.originPort} ke ${selectedSchedule?.destinationPort}\n\n`;
      csvContent += "=== MANIFES MUATAN KARGO ===\n";
      csvContent += "No B/L,Pengirim,Penerima,Jenis Kargo,Tonase,No Kontainer/Plat,Status\n";
      manifestCargo.forEach(c => {
        csvContent += `"${c.billOfLadingNumber}","${c.senderName}","${c.receiverName}","${c.cargoType}",${c.weightTons},"${c.containerOrPlateNumber || ''}","${c.shipmentStatus}"\n`;
      });
      csvContent += "\n=== MANIFES PENUMPANG ===\n";
      csvContent += "No Tiket,Nama Penumpang,NIK,Kelas,Kabin/Kursi,Status Boarding\n";
      manifestTickets.forEach(t => {
        csvContent += `"${t.ticketNumber}","${t.passengerName}","${t.identityNumber}","${t.passengerClass}","${t.seatOrCabinNumber}","${t.boardingStatus}"\n`;
      });
      downloadFile(csvContent, `Manifest-Voyage-${selectedSchedule?.voyageNumber}.csv`, 'text/csv');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header and Print / Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Laporan Eksekutif, Keuangan & Manifes Pelayaran</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rekapitulasi pendapatan kargo & penumpang, load factor kapal, dan dokumen resmi manifes syahbandar.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-600/25 text-sm font-semibold border border-cyan-400/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setReportTab('financial')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            reportTab === 'financial'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Laporan Omzet Keuangan</span>
        </button>

        <button
          onClick={() => setReportTab('manifest')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            reportTab === 'manifest'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manifes Syahbandar (Port Clearance)</span>
        </button>

        <button
          onClick={() => setReportTab('utilization')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            reportTab === 'utilization'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Load Factor & Utilisasi Kapal</span>
        </button>
      </div>

      {/* Tab 1: Financial Report */}
      {reportTab === 'financial' && (
        <div className="space-y-6">
          
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-slate-850/80 border border-slate-700/60 shadow-lg space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Omzet Gabungan
              </span>
              <div className="text-3xl font-extrabold text-white">
                {formatRupiah(totalGrossIncome)}
              </div>
              <p className="text-xs text-emerald-400 flex items-center pt-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Data Penerimaan Terverifikasi Lunas
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-850/80 border border-slate-700/60 shadow-lg space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pendapatan Muatan Kargo (B/L)
              </span>
              <div className="text-3xl font-extrabold text-cyan-400">
                {formatRupiah(totalCargoIncome)}
              </div>
              <p className="text-xs text-slate-400">
                {paidCargo.length} Transaksi B/L • {totalCargoTons} Ton Muatan
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-850/80 border border-slate-700/60 shadow-lg space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pendapatan Tiket Penumpang
              </span>
              <div className="text-3xl font-extrabold text-violet-400">
                {formatRupiah(totalTicketIncome)}
              </div>
              <p className="text-xs text-slate-400">
                {paidTickets.length} Penumpang Terdaftar Lunas
              </p>
            </div>
          </div>

          {/* Detailed Revenue Breakdown Table */}
          <div className="p-6 rounded-3xl bg-slate-850/80 border border-slate-700/60 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white">Rincian Transaksi Pendapatan Pelayaran</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Layanan</th>
                    <th className="py-3 px-4">No. Resi / Tiket</th>
                    <th className="py-3 px-4">Pelayaran & Rute</th>
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4 text-right">Nilai Tagihan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cargo.slice(0, 5).map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-cyan-400 flex items-center space-x-1.5">
                        <Package className="w-3.5 h-3.5" />
                        <span>Kargo ({c.cargoType})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{c.billOfLadingNumber}</td>
                      <td className="py-3 px-4 text-xs">{c.shipName}</td>
                      <td className="py-3 px-4 text-xs">{c.senderName}</td>
                      <td className="py-3 px-4 text-right font-bold text-white">{formatRupiah(c.totalAmount)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {c.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {tickets.slice(0, 5).map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-violet-400 flex items-center space-x-1.5">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Tiket ({t.passengerClass})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{t.ticketNumber}</td>
                      <td className="py-3 px-4 text-xs">{t.shipName}</td>
                      <td className="py-3 px-4 text-xs">{t.passengerName}</td>
                      <td className="py-3 px-4 text-right font-bold text-white">{formatRupiah(t.totalFare)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {t.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Harbour Master Manifest (Port Clearance) */}
      {reportTab === 'manifest' && (
        <div className="space-y-6">
          
          {/* Voyage Selector */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Ship className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-bold text-white">Pilih Pelayaran Kapal (Voyage):</label>
            </div>
            <select
              value={selectedVoyageId}
              onChange={(e) => setSelectedVoyageId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {schedules.map(sc => (
                <option key={sc.id} value={sc.id}>
                  {sc.voyageNumber} - {sc.shipName} ({sc.originPort} ➔ {sc.destinationPort})
                </option>
              ))}
            </select>
          </div>

          {/* Official Document Sheet */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-700/90 shadow-2xl space-y-6 text-slate-200">
            
            {/* Header Document */}
            <div className="text-center border-b-2 border-slate-700 pb-6 space-y-1">
              <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                REPUBLIK INDONESIA • KEMENTERIAN PERHUBUNGAN LAUT
              </div>
              <h2 className="text-2xl font-black text-white tracking-wider">
                SURAT PERSETUJUAN BERLAYAR & MANIFES MUATAN KAPAL
              </h2>
              <div className="text-sm text-slate-400">
                PT. ARS LOGISTIC AND PASSENGER SERVICE • KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN
              </div>
            </div>

            {/* Vessel & Voyage Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Nama Kapal:</span>
                <strong className="text-white text-sm">{selectedSchedule?.shipName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Nomor Voyage:</span>
                <strong className="text-cyan-300 font-mono text-sm">{selectedSchedule?.voyageNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Pelabuhan Tolak:</span>
                <strong className="text-white">{selectedSchedule?.originPort}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Pelabuhan Tujuan:</span>
                <strong className="text-white">{selectedSchedule?.destinationPort}</strong>
              </div>
            </div>

            {/* Cargo Manifest Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>I. DAFTAR MANIFES MUATAN KARGO & KONTAINER ({manifestCargo.length} Item)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">No. B/L</th>
                      <th className="py-2.5 px-3">Pengirim</th>
                      <th className="py-2.5 px-3">Penerima</th>
                      <th className="py-2.5 px-3">Jenis Kargo</th>
                      <th className="py-2.5 px-3">Tonase</th>
                      <th className="py-2.5 px-3">No. Kontainer / Plat</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {manifestCargo.length > 0 ? (
                      manifestCargo.map(c => (
                        <tr key={c.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-white">{c.billOfLadingNumber}</td>
                          <td className="py-2.5 px-3">{c.senderName}</td>
                          <td className="py-2.5 px-3">{c.receiverName}</td>
                          <td className="py-2.5 px-3">{c.cargoType}</td>
                          <td className="py-2.5 px-3 font-bold">{c.weightTons} Ton</td>
                          <td className="py-2.5 px-3 font-mono">{c.containerOrPlateNumber || '-'}</td>
                          <td className="py-2.5 px-3">{c.shipmentStatus}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          Belum ada muatan kargo yang terdaftar pada pelayaran ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Passenger Manifest Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-violet-300 uppercase tracking-wider flex items-center space-x-2">
                <Ticket className="w-4 h-4" />
                <span>II. DAFTAR MANIFES PENUMPANG RESMI ({manifestTickets.length} Jiwa)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">No. Tiket</th>
                      <th className="py-2.5 px-3">Nama Penumpang</th>
                      <th className="py-2.5 px-3">Nomor Identitas (NIK)</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">No. Kabin/Kursi</th>
                      <th className="py-2.5 px-3">Status Boarding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {manifestTickets.length > 0 ? (
                      manifestTickets.map(t => (
                        <tr key={t.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-white">{t.ticketNumber}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-200">{t.passengerName}</td>
                          <td className="py-2.5 px-3 font-mono">{t.identityNumber}</td>
                          <td className="py-2.5 px-3">{t.passengerClass}</td>
                          <td className="py-2.5 px-3 font-bold">{t.seatOrCabinNumber}</td>
                          <td className="py-2.5 px-3">{t.boardingStatus}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Belum ada penumpang yang terdaftar pada pelayaran ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800 text-xs text-center">
              <div>
                <p className="text-slate-400">Petugas Syahbandar Pelabuhan,</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-[10px] font-mono border border-dashed border-slate-700 px-3 py-1 text-slate-500 rounded">
                    [ TERA STAMP RESMI ]
                  </span>
                </div>
                <strong className="text-white block">Capt. Bambang Sudarmono, S.ST.Pel</strong>
                <span className="text-slate-500 text-[10px]">NIP. 19780512 200212 1 003</span>
              </div>
              <div>
                <p className="text-slate-400">Nahkoda Kapal (Master Mariner),</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-[10px] font-mono border border-dashed border-slate-700 px-3 py-1 text-slate-500 rounded">
                    [ TANDA TANGAN & CAP KAPAL ]
                  </span>
                </div>
                <strong className="text-white block">Capt. Hendra Gunawan, M.Mar</strong>
                <span className="text-slate-500 text-[10px]">Master KM. ARS Nusantara</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 3: Ship Capacity Load Factor */}
      {reportTab === 'utilization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ships.map(ship => {
              // Find related schedules
              const shipSchedules = schedules.filter(s => s.shipId === ship.id);
              const totalBookedCargo = shipSchedules.reduce((acc, curr) => acc + (curr.bookedCargoTons || 0), 0);
              const cargoLoadFactor = ship.cargoCapacityTons > 0 
                ? Math.min(100, Math.round((totalBookedCargo / ship.cargoCapacityTons) * 100))
                : 0;

              return (
                <div key={ship.id} className="p-6 rounded-3xl bg-slate-850/80 border border-slate-700/60 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-base">{ship.name}</h3>
                      <span className="text-xs text-cyan-400 font-mono">{ship.code} • {ship.type}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      ship.status === 'Active' || ship.status === 'Sailing'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {ship.status}
                    </span>
                  </div>

                  {/* Load factor bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Load Factor Kargo:</span>
                      <strong className="text-white">{cargoLoadFactor}% Terisi</strong>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          cargoLoadFactor > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${cargoLoadFactor}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Terisi: {totalBookedCargo} Ton</span>
                      <span>Kapasitas: {ship.cargoCapacityTons} Ton</span>
                    </div>
                  </div>

                  {ship.passengerCapacity > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Kapasitas Penumpang:</span>
                        <strong className="text-violet-300">{ship.passengerCapacity} Pax</strong>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                    <span>Nahkoda: {ship.captainName}</span>
                    <span>Kecepatan: {ship.speedKnots} Knot</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
