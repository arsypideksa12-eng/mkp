import React, { useState } from 'react';
import { 
  Tag, 
  Package, 
  Ticket, 
  Calculator, 
  Percent, 
  ShieldCheck, 
  Info,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Route, CargoType, PassengerClass } from '../../types';

interface TariffsMasterProps {
  routes: Route[];
}

export const TariffsMaster: React.FC<TariffsMasterProps> = ({ routes }) => {
  // Calculator States
  const [calcType, setCalcType] = useState<'cargo' | 'passenger'>('cargo');
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || '');
  
  // Cargo Calc State
  const [selectedCargoType, setSelectedCargoType] = useState<CargoType>('Dry Container 20ft');
  const [cargoWeight, setCargoWeight] = useState(15);
  const [includeInsurance, setIncludeInsurance] = useState(true);

  // Passenger Calc State
  const [selectedPassengerClass, setSelectedPassengerClass] = useState<PassengerClass>('Bisnis AC');
  const [paxCount, setPaxCount] = useState(2);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Cargo multiplier rules
  const getCargoMultiplier = (type: CargoType): number => {
    switch (type) {
      case 'Dry Container 20ft': return 1.2;
      case 'Dry Container 40ft': return 2.1;
      case 'Reefer Cold Container': return 1.8; // requires electrical generator
      case 'General Cargo (Pallet)': return 1.0;
      case 'Heavy Equipment / Truk': return 1.5;
      case 'Vehicles / Kendaraan': return 1.3;
      case 'Liquid / Bulk': return 0.9;
      default: return 1.0;
    }
  };

  // Passenger class multiplier rules
  const getPassengerMultiplier = (pClass: PassengerClass): number => {
    switch (pClass) {
      case 'VIP Cabin': return 2.3;
      case 'Kelas 1': return 1.7;
      case 'Bisnis AC': return 1.35;
      case 'Ekonomi Dek': return 1.0;
      default: return 1.0;
    }
  };

  // Calculations
  const baseRateCargo = selectedRoute ? selectedRoute.baseCargoRatePerTon : 500000;
  const cargoMult = getCargoMultiplier(selectedCargoType);
  const estimatedShippingFee = baseRateCargo * cargoWeight * cargoMult;
  const cargoInsuranceFee = includeInsurance ? Math.max(150000, estimatedShippingFee * 0.005) : 0;
  const cargoPortFee = 250000; // Pas pelabuhan & jasa dermaga
  const totalCargoEst = estimatedShippingFee + cargoInsuranceFee + cargoPortFee;

  const baseFarePassenger = selectedRoute ? selectedRoute.basePassengerFare : 300000;
  const paxMult = getPassengerMultiplier(selectedPassengerClass);
  const singlePaxFare = Math.round(baseFarePassenger * paxMult);
  const singleInsurance = 20000; // Jasa Raharja
  const singlePortFee = 15000; // Pas Pelabuhan
  const totalSingleTicket = singlePaxFare + singleInsurance + singlePortFee;
  const totalPassengerEst = totalSingleTicket * paxCount;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
          <Tag className="w-6 h-6 text-cyan-400" />
          <span>Master Data Tarif, Layanan & Kalkulator Simulasi</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Standar acuan biaya freight muatan kontainer, kendaraan, kargo curah, serta kelas tiket penumpang ARS Maritime.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cargo Tariff Table */}
        <div className="p-6 rounded-3xl bg-slate-850/80 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Struktur Tarif Kargo & Kontainer</h2>
            </div>
            <span className="text-xs bg-slate-800 text-cyan-300 font-semibold px-2.5 py-1 rounded-full border border-slate-700">
              B/L Manifest
            </span>
          </div>

          <div className="space-y-3">
            {[
              { type: 'Dry Container 20ft', mult: 'x 1.20', desc: 'Standar muatan boks kontainer ukuran 20 kaki (Max 24 Ton)' },
              { type: 'Dry Container 40ft', mult: 'x 2.10', desc: 'Standar kontainer ukuran 40 kaki High Cube (Max 30 Ton)' },
              { type: 'Reefer Cold Container', mult: 'x 1.80', desc: 'Kontainer berpendingin (frozen/chilled) + Genset kapal 24 jam' },
              { type: 'General Cargo (Pallet)', mult: 'x 1.00', desc: 'Muatan umum kemasan kardus / karung dalam pallet terbungkus plastik' },
              { type: 'Heavy Equipment / Truk', mult: 'x 1.50', desc: 'Truk tronton, alat berat excavator, loader + Lashing rantai dek' },
              { type: 'Vehicles / Kendaraan', mult: 'x 1.30', desc: 'Mobil penumpang, minibus, dan armada komersial' },
              { type: 'Liquid / Bulk', mult: 'x 0.90', desc: 'Curah kering (semen/pasir) atau tangki cairan industri' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-semibold text-sm text-slate-200">{item.type}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800">
                    {item.mult}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passenger Tariff Table */}
        <div className="p-6 rounded-3xl bg-slate-850/80 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
                <Ticket className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Struktur Kelas Tiket Penumpang</h2>
            </div>
            <span className="text-xs bg-slate-800 text-violet-300 font-semibold px-2.5 py-1 rounded-full border border-slate-700">
              Boarding Pass
            </span>
          </div>

          <div className="space-y-3">
            {[
              { 
                cls: 'VIP Cabin', 
                mult: 'x 2.30', 
                facilities: 'Kabin privat 2-4 ranjang springbed, Kamar mandi dalam, Smart TV, AC dingin, Free Meals 3x & Snack' 
              },
              { 
                cls: 'Kelas 1', 
                mult: 'x 1.70', 
                facilities: 'Kabin semi-privat 4 ranjang, Meja kerja, AC sentral, Wastafel, Free Meals 3x per hari' 
              },
              { 
                cls: 'Bisnis AC', 
                mult: 'x 1.35', 
                facilities: 'Kursi reclining ergonomis ber-AC, Port charger HP di tiap kursi, Ruang santai musik' 
              },
              { 
                cls: 'Ekonomi Dek', 
                mult: 'x 1.00', 
                facilities: 'Ranjang kasur dek luas bertingkat, Stopkontak bersama, Layanan kantin kapal 24 jam' 
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-100">{item.cls}</div>
                  <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800">
                    {item.mult}
                  </span>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  {item.facilities}
                </div>
              </div>
            ))}

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Komponen Biaya Wajib Tiket:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Iuran Wajib Asuransi Jasa Raharja: Rp 20.000 / Penumpang</li>
                <li>Pas Masuk Pelabuhan & Fasilitas Dermaga: Rp 15.000 / Penumpang</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Simulation Calculator */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950/60 border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-cyan-600/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Simulasi Perhitungan Tarif Cepat</h3>
              <p className="text-xs text-slate-400">Hitung estimasi ongkos kirim kargo atau biaya tiket penumpang otomatis</p>
            </div>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setCalcType('cargo')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                calcType === 'cargo'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulasi Muatan Kargo
            </button>
            <button
              onClick={() => setCalcType('passenger')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                calcType === 'passenger'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulasi Tiket Penumpang
            </button>
          </div>
        </div>

        {/* Route Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Pilih Rute Pelayaran</label>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
          >
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                {r.originPort} ➔ {r.destinationPort} ({r.distanceNm} NM, ~{r.estimatedHours} Jam)
              </option>
            ))}
          </select>
        </div>

        {calcType === 'cargo' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cargo Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Jenis Kargo / Kontainer</label>
                  <select
                    value={selectedCargoType}
                    onChange={(e) => setSelectedCargoType(e.target.value as CargoType)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Dry Container 20ft">Dry Container 20ft</option>
                    <option value="Dry Container 40ft">Dry Container 40ft</option>
                    <option value="Reefer Cold Container">Reefer Cold Container (Pendingin)</option>
                    <option value="General Cargo (Pallet)">General Cargo (Pallet)</option>
                    <option value="Heavy Equipment / Truk">Heavy Equipment / Truk</option>
                    <option value="Vehicles / Kendaraan">Vehicles / Kendaraan</option>
                    <option value="Liquid / Bulk">Liquid / Bulk (Curah)</option>
                  </select>
                </div>

                {/* Weight Tons */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Berat Muatan (Ton)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

              </div>

              {/* Checkbox Insurance */}
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0 bg-slate-800 border-slate-700"
                />
                <span>Sertakan Asuransi Marine Cargo All-Risk (0.5% dari freight)</span>
              </label>
            </div>

            {/* Price Preview Result */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Estimasi Total Freight</span>
                <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                  {formatRupiah(totalCargoEst)}
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Ongkos Angkut:</span>
                  <span className="text-slate-200">{formatRupiah(estimatedShippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Asuransi Muatan:</span>
                  <span className="text-slate-200">{formatRupiah(cargoInsuranceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jasa Dermaga / Pas:</span>
                  <span className="text-slate-200">{formatRupiah(cargoPortFee)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Passenger Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Pilihan Kelas Tiket</label>
                  <select
                    value={selectedPassengerClass}
                    onChange={(e) => setSelectedPassengerClass(e.target.value as PassengerClass)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="VIP Cabin">VIP Cabin (Privat Luxury)</option>
                    <option value="Kelas 1">Kelas 1 (Kabin 4 Bed)</option>
                    <option value="Bisnis AC">Bisnis AC (Kursi Reclining)</option>
                    <option value="Ekonomi Dek">Ekonomi Dek</option>
                  </select>
                </div>

                {/* Passenger Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Jumlah Penumpang</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={paxCount}
                    onChange={(e) => setPaxCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

              </div>
            </div>

            {/* Price Preview Result */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Total Biaya Tiket ({paxCount} Pax)</span>
                <div className="text-2xl font-extrabold text-violet-400 mt-1">
                  {formatRupiah(totalPassengerEst)}
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Tarif Tiket / Orang:</span>
                  <span className="text-slate-200">{formatRupiah(singlePaxFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Asuransi Jasa Raharja:</span>
                  <span className="text-slate-200">{formatRupiah(singleInsurance * paxCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pas Masuk Pelabuhan:</span>
                  <span className="text-slate-200">{formatRupiah(singlePortFee * paxCount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
