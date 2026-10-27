import React from 'react';
import { 
  LayoutDashboard, 
  Ship, 
  MapPin, 
  Tag, 
  Package, 
  Ticket, 
  CalendarDays, 
  BarChart3, 
  Database, 
  FileText, 
  X,
  Compass,
  ArrowRightLeft
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts: {
    ships: number;
    routes: number;
    schedules: number;
    cargo: number;
    tickets: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  counts
}) => {
  const navSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Ringkasan Dashboard', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'master_ships', label: 'Data Kapal / Armada', icon: Ship, badge: counts.ships },
        { id: 'master_routes', label: 'Data Rute & Pelabuhan', icon: MapPin, badge: counts.routes },
        { id: 'master_tariffs', label: 'Data Tarif & Layanan', icon: Tag, badge: null }
      ]
    },
    {
      title: 'TRANSAKSI DATA',
      items: [
        { id: 'trans_cargo', label: 'Muatan Kapal & B/L', icon: Package, badge: counts.cargo, highlight: true },
        { id: 'trans_passengers', label: 'Tiket & Penumpang', icon: Ticket, badge: counts.tickets, highlight: true },
        { id: 'trans_schedules', label: 'Jadwal Pelayaran', icon: CalendarDays, badge: counts.schedules }
      ]
    },
    {
      title: 'LAPORAN & KONEKSI',
      items: [
        { id: 'reports', label: 'Laporan & Manifest', icon: BarChart3, badge: null },
        { id: 'database_sync', label: 'Real Database Sync', icon: Database, badge: 'Cloud' }
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    onSelectView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-18 bottom-0 left-0 z-40 w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out backdrop-blur-md overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ height: 'calc(100vh - 4.5rem)' }}
      >
        <div className="p-4 space-y-6">
          
          {/* Mobile Header Close */}
          <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <span>NAVIGASI SISTEM</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              <div className="mt-1 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== null && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : item.badge === 'Cloud' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Nautical Card Footer */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-850/80 border border-slate-700/60 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>ARS Central Dispatch</span>
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
              v2.6
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Terintegrasi sistem logistik kontainer & pelayaran penumpang antar-pulau Indonesia.
          </p>
        </div>
      </aside>
    </>
  );
};
