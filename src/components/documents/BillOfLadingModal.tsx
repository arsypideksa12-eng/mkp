import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Anchor, 
  ShieldCheck, 
  Barcode, 
  Package, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { CargoShipment } from '../../types';

interface BillOfLadingModalProps {
  cargo: CargoShipment | null;
  onClose: () => void;
}

export const BillOfLadingModal: React.FC<BillOfLadingModalProps> = ({
  cargo,
  onClose
}) => {
  if (!cargo) return null;

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
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-10 space-y-6 shadow-2xl relative my-8 print:border-none print:shadow-none print:m-0 print:p-4 print:bg-white print:text-black">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Anchor className="w-5 h-5" />
            <span className="font-bold text-sm">SURAT MUATAN KAPAL RESMI (BILL OF LADING)</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Nautical White/Slate styling in print) */}
        <div className="bg-white text-slate-900 p-8 rounded-2xl border-2 border-slate-900 space-y-6 shadow-md print:shadow-none">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-slate-950 text-cyan-400 rounded-xl flex items-center justify-center">
                <Anchor className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-950">
                  ARS LOGISTIC AND PASSENGER SERVICE
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  PT. ARS MARITIM LOGISTIK NUSANTARA • OCEAN FREIGHT & CONTAINER SERVICES
                </p>
                <p className="text-[10px] text-slate-500">
                  Kantor Operasional Pelabuhan: Terminal Nusantara II, Telp: (021) 4390-8812, www.arslogistic.id
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l-2 sm:border-slate-900 sm:pl-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                ORIGINAL BILL OF LADING
              </div>
              <div className="text-lg font-mono font-black text-blue-900">
                {cargo.billOfLadingNumber}
              </div>
              <div className="text-[11px] font-semibold text-slate-600">
                Tanggal Terbit: {new Date(cargo.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </div>
            </div>
          </div>

          {/* Parties Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-slate-800 text-xs">
            {/* Shipper */}
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-slate-800 space-y-1">
              <span className="font-bold text-[10px] text-slate-500 uppercase block">1. PENGIRIM (SHIPPER):</span>
              <div className="font-bold text-sm text-slate-950">{cargo.senderName}</div>
              <div className="text-slate-600">{cargo.senderAddress || 'Pelabuhan Pemuatan'}</div>
              <div className="text-slate-700 font-medium">Kontak: {cargo.senderPhone}</div>
            </div>

            {/* Consignee */}
            <div className="p-3 space-y-1">
              <span className="font-bold text-[10px] text-slate-500 uppercase block">2. PENERIMA (CONSIGNEE):</span>
              <div className="font-bold text-sm text-slate-950">{cargo.receiverName}</div>
              <div className="text-slate-600">{cargo.receiverAddress || 'Pelabuhan Pembongkaran'}</div>
              <div className="text-slate-700 font-medium">Kontak: {cargo.receiverPhone}</div>
            </div>
          </div>

          {/* Voyage & Port Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-800 text-xs bg-slate-50">
            <div className="p-2.5 border-r border-b sm:border-b-0 border-slate-850">
              <span className="font-bold text-[10px] text-slate-500 block">NAMA KAPAL (VESSEL):</span>
              <strong className="text-slate-900">{cargo.shipName}</strong>
            </div>
            <div className="p-2.5 border-b sm:border-b-0 sm:border-r border-slate-850">
              <span className="font-bold text-[10px] text-slate-500 block">NOMOR VOYAGE:</span>
              <strong className="text-slate-900 font-mono">{cargo.voyageNumber}</strong>
            </div>
            <div className="p-2.5 border-r border-slate-850">
              <span className="font-bold text-[10px] text-slate-500 block">PELABUHAN MUAT (POL):</span>
              <strong className="text-slate-900">{cargo.originPort}</strong>
            </div>
            <div className="p-2.5">
              <span className="font-bold text-[10px] text-slate-500 block">PELABUHAN TUJUAN (POD):</span>
              <strong className="text-slate-900">{cargo.destinationPort}</strong>
            </div>
          </div>

          {/* Cargo Particulars Table */}
          <div className="border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-200 border-b border-slate-800 text-[10px] font-bold text-slate-700 uppercase">
                <tr>
                  <th className="py-2 px-3">Tanda / No. Kontainer</th>
                  <th className="py-2 px-3">Jenis Muatan & Kemasan</th>
                  <th className="py-2 px-3">Uraian Barang (Description)</th>
                  <th className="py-2 px-3 text-right">Berat Kotor (Ton)</th>
                  <th className="py-2 px-3 text-right">Volume (m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-blue-900">
                    {cargo.containerOrPlateNumber || 'NON-CONTAINER / BULK'}
                  </td>
                  <td className="py-3 px-3 font-semibold">{cargo.cargoType}</td>
                  <td className="py-3 px-3">
                    <div>{cargo.cargoDescription}</div>
                    {cargo.handlingInstructions && (
                      <div className="text-[10px] text-rose-800 italic mt-0.5">
                        * {cargo.handlingInstructions}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-bold">{cargo.weightTons} MT</td>
                  <td className="py-3 px-3 text-right">{cargo.volumeM3 ? `${cargo.volumeM3} CBM` : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Freight Breakdown & Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start border border-slate-800 p-4 bg-slate-50 text-xs gap-4">
            <div className="space-y-1">
              <span className="font-bold text-slate-700 block">KETENTUAN FREIGHT:</span>
              <p className="text-[10px] text-slate-600 max-w-md leading-relaxed">
                Muatan diangkut tunduk pada syarat dan ketentuan standar pengangkutan laut The Hague-Visby Rules. Tanggung jawab pengangkut dibatasi sesuai undang-undang pelayaran yang berlaku.
              </p>
              <div className="text-[10px] font-bold text-emerald-800 flex items-center pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>Status Pembayaran: {cargo.paymentStatus.toUpperCase()}</span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1 text-right">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Ongkos Muatan Laut:</span>
                <span>{formatRupiah(cargo.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Asuransi Marine:</span>
                <span>{formatRupiah(cargo.insuranceFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Pas Pelabuhan:</span>
                <span>{formatRupiah(cargo.portFee)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-950 pt-2 border-t border-slate-300">
                <span>TOTAL FREIGHT:</span>
                <span>{formatRupiah(cargo.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Barcode */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-400 text-xs text-center items-end">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500">Tanda Tangan Pengirim,</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 font-mono">( TTD & Cap Shipper )</span>
              </div>
              <strong className="block text-slate-900">{cargo.senderName}</strong>
            </div>

            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="font-mono text-2xl tracking-widest text-slate-900">
                ||| | |||| | ||||| ||| |||
              </div>
              <span className="font-mono text-[10px] text-slate-600">{cargo.billOfLadingNumber}</span>
              <span className="text-[9px] text-slate-400 uppercase">ARS VERIFIED MARITIME SYSTEM</span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500">Untuk dan Atas Nama Pengangkut (Carrier),</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-blue-900 font-mono font-bold border-2 border-blue-900 px-3 py-1 rounded">
                  [ TERA RESMI ARS LOGISTIC ]
                </span>
              </div>
              <strong className="block text-slate-900">Capt. & Officer On Duty</strong>
              <span className="text-[10px] text-slate-500">ARS Logistic Terminal Manager</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
