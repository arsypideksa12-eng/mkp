import React from 'react';
import { 
  X, 
  Printer, 
  Anchor, 
  Ticket, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Compass 
} from 'lucide-react';
import { PassengerTicket } from '../../types';

interface BoardingPassModalProps {
  ticket: PassengerTicket | null;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({
  ticket,
  onClose
}) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 print:border-none print:shadow-none print:m-0 print:p-4 print:bg-white print:text-black">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center space-x-2 text-violet-400">
            <Ticket className="w-5 h-5" />
            <span className="font-bold text-sm">TIKET ELEKTRONIK & BOARDING PASS RESMI</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Boarding Pass</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Boarding Pass Card */}
        <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden print:shadow-none">
          
          {/* Top Brand Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40">
                <Anchor className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-cyan-300">ARS LOGISTIC & PASSENGER</span>
                <p className="text-[10px] text-slate-300 tracking-wider">BOARDING PASS PELAYARAN NUSANTARA</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">KODE RESERVASI</span>
              <span className="font-mono font-black text-lg text-cyan-400">{ticket.ticketNumber}</span>
            </div>
          </div>

          {/* Main Boarding Pass Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Travel & Passenger Details */}
            <div className="md:col-span-2 space-y-4">
              
              {/* Route Banner */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">PELABUHAN ASAL</span>
                  <strong className="text-sm text-slate-950">{ticket.originPort}</strong>
                </div>
                <div className="text-center px-3">
                  <Compass className="w-5 h-5 text-blue-700 mx-auto" />
                  <span className="text-[10px] font-bold text-blue-800">DIRECT</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">PELABUHAN TUJUAN</span>
                  <strong className="text-sm text-slate-950">{ticket.destinationPort}</strong>
                </div>
              </div>

              {/* Passenger & Ticket Data */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">NAMA PENUMPANG</span>
                  <strong className="text-sm text-slate-950 uppercase">{ticket.passengerName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">NOMOR IDENTITAS (NIK)</span>
                  <strong className="font-mono text-slate-900">{ticket.identityNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">ARMADA KAPAL</span>
                  <strong className="text-slate-900">{ticket.shipName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">NOMOR VOYAGE</span>
                  <strong className="font-mono text-slate-900">{ticket.voyageNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">WAKTU KEBERANGKATAN</span>
                  <strong className="text-slate-900">
                    {new Date(ticket.departureTime).toLocaleDateString('id-ID', { dateStyle: 'medium' })}, {new Date(ticket.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">STATUS PEMBAYARAN</span>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    LUNAS ({formatRupiah(ticket.totalFare)})
                  </span>
                </div>
              </div>

              {/* Safety notice */}
              <div className="text-[10px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-200">
                <p>• Termasuk Iuran Wajib Asuransi Kecelakaan Penumpang Kapal Laut PT. Jasa Raharja (Persero).</p>
                <p>• Harap tiba di dermaga pelabuhan paling lambat 60 menit sebelum waktu kapal diberangkatkan.</p>
              </div>

            </div>

            {/* Right Col: Cabin / Seat & QR Code (Perforated look) */}
            <div className="md:border-l-2 md:border-dashed md:border-slate-300 md:pl-6 flex flex-col justify-between items-center text-center space-y-4">
              
              <div className="w-full">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">KELAS LAYANAN</span>
                <span className="inline-block mt-1 px-3 py-1 bg-violet-100 text-violet-900 border border-violet-300 rounded-lg text-xs font-bold uppercase">
                  {ticket.passengerClass}
                </span>

                <div className="mt-3 p-3 bg-slate-100 rounded-xl border border-slate-300">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">NO. KAMAR / KURSI</span>
                  <div className="text-2xl font-black text-slate-950 font-mono tracking-wider">
                    {ticket.seatOrCabinNumber}
                  </div>
                </div>
              </div>

              {/* Simulated QR Code Graphic */}
              <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-900 p-1.5 rounded-lg flex items-center justify-center text-white">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
                <span className="font-mono text-[9px] text-slate-600 mt-1">SCAN AT GATE</span>
              </div>

              <div className="w-full font-mono text-[10px] text-slate-600 tracking-widest border-t border-slate-200 pt-2">
                ||| ||||| || |||| |||
                <div className="text-[9px] text-slate-400 mt-0.5">ARS PASSENGER SYSTEM</div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
