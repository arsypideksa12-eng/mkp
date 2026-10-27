import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ShipsMaster } from './components/master/ShipsMaster';
import { RoutesMaster } from './components/master/RoutesMaster';
import { TariffsMaster } from './components/master/TariffsMaster';
import { CargoTransactions } from './components/transactions/CargoTransactions';
import { PassengerTransactions } from './components/transactions/PassengerTransactions';
import { SchedulesManager } from './components/transactions/SchedulesManager';
import { ReportsView } from './components/reports/ReportsView';
import { DatabaseSyncView } from './components/database/DatabaseSyncView';
import { LoginModal } from './components/auth/LoginModal';
import { BillOfLadingModal } from './components/documents/BillOfLadingModal';
import { BoardingPassModal } from './components/documents/BoardingPassModal';

import { 
  Ship, 
  Route, 
  Schedule, 
  CargoShipment, 
  PassengerTicket, 
  AdminUser 
} from './types';

import { 
  INITIAL_SHIPS, 
  INITIAL_ROUTES, 
  INITIAL_SCHEDULES, 
  INITIAL_CARGO, 
  INITIAL_TICKETS 
} from './services/mockData';

import { 
  subscribeCollection, 
  saveDocument, 
  deleteDocument, 
  COLLECTIONS, 
  testFirestoreConnection,
  seedInitialFirestoreData,
  auth
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('ars_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback default
      }
    }
    // Default active admin for immediate usability
    return {
      id: 'admin-01',
      username: 'arsypideksa12',
      email: 'arsypideksa12@gmail.com',
      displayName: 'Arsy Pideksa (Admin Utama)',
      role: 'Super Admin'
    };
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Real Database Data State
  const [ships, setShips] = useState<Ship[]>(INITIAL_SHIPS);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [cargo, setCargo] = useState<CargoShipment[]>(INITIAL_CARGO);
  const [tickets, setTickets] = useState<PassengerTicket[]>(INITIAL_TICKETS);

  // Status & Modals
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCargoForBL, setSelectedCargoForBL] = useState<CargoShipment | null>(null);
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<PassengerTicket | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial Cloud Connection Check & Firebase Auth Listener
  useEffect(() => {
    async function checkConnection() {
      const res = await testFirestoreConnection();
      setIsCloudConnected(res.success);
    }
    checkConnection();

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const admin: AdminUser = {
          id: user.uid,
          username: user.email?.split('@')[0] || 'admin',
          email: user.email || 'admin@arslogistic.id',
          displayName: user.displayName || 'Authorized Admin',
          role: 'Super Admin',
          avatarUrl: user.photoURL || undefined
        };
        setCurrentUser(admin);
        localStorage.setItem('ars_admin_session', JSON.stringify(admin));
      }
    });

    return () => unsubAuth();
  }, []);

  // 2. Real-time Subscriptions to Firestore Collections
  useEffect(() => {
    const unsubShips = subscribeCollection<Ship>(
      COLLECTIONS.SHIPS,
      INITIAL_SHIPS,
      (data) => setShips(data)
    );

    const unsubRoutes = subscribeCollection<Route>(
      COLLECTIONS.ROUTES,
      INITIAL_ROUTES,
      (data) => setRoutes(data)
    );

    const unsubSchedules = subscribeCollection<Schedule>(
      COLLECTIONS.SCHEDULES,
      INITIAL_SCHEDULES,
      (data) => setSchedules(data)
    );

    const unsubCargo = subscribeCollection<CargoShipment>(
      COLLECTIONS.CARGO,
      INITIAL_CARGO,
      (data) => setCargo(data)
    );

    const unsubTickets = subscribeCollection<PassengerTicket>(
      COLLECTIONS.TICKETS,
      INITIAL_TICKETS,
      (data) => setTickets(data)
    );

    return () => {
      unsubShips();
      unsubRoutes();
      unsubSchedules();
      unsubCargo();
      unsubTickets();
    };
  }, []);

  // Sync / Refresh Handler
  const handleRefreshData = async () => {
    setIsSyncing(true);
    try {
      const res = await testFirestoreConnection();
      setIsCloudConnected(res.success);
      showToast('Database Cloud Firestore tersinkronisasi.');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    localStorage.setItem('ars_admin_session', JSON.stringify(user));
    showToast(`Selamat datang, ${user.displayName}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ars_admin_session');
    showToast('Admin berhasil logout.');
  };

  // CRUD Handlers for Ships
  const handleSaveShip = async (ship: Ship) => {
    await saveDocument(COLLECTIONS.SHIPS, ship);
    setShips(prev => {
      const idx = prev.findIndex(s => s.id === ship.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = ship;
        return copy;
      }
      return [ship, ...prev];
    });
    showToast(`Data kapal ${ship.name} berhasil disimpan.`);
  };

  const handleDeleteShip = async (shipId: string) => {
    await deleteDocument(COLLECTIONS.SHIPS, shipId);
    setShips(prev => prev.filter(s => s.id !== shipId));
    showToast('Data kapal berhasil dihapus dari database.');
  };

  // CRUD Handlers for Routes
  const handleSaveRoute = async (route: Route) => {
    await saveDocument(COLLECTIONS.ROUTES, route);
    setRoutes(prev => {
      const idx = prev.findIndex(r => r.id === route.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = route;
        return copy;
      }
      return [route, ...prev];
    });
    showToast('Data rute pelabuhan berhasil disimpan.');
  };

  const handleDeleteRoute = async (routeId: string) => {
    await deleteDocument(COLLECTIONS.ROUTES, routeId);
    setRoutes(prev => prev.filter(r => r.id !== routeId));
    showToast('Rute pelayaran berhasil dihapus.');
  };

  // CRUD Handlers for Schedules
  const handleSaveSchedule = async (schedule: Schedule) => {
    await saveDocument(COLLECTIONS.SCHEDULES, schedule);
    setSchedules(prev => {
      const idx = prev.findIndex(s => s.id === schedule.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = schedule;
        return copy;
      }
      return [schedule, ...prev];
    });
    showToast(`Jadwal pelayaran ${schedule.voyageNumber} berhasil disimpan.`);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    await deleteDocument(COLLECTIONS.SCHEDULES, scheduleId);
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    showToast('Jadwal pelayaran berhasil dihapus.');
  };

  // CRUD Handlers for Cargo
  const handleSaveCargo = async (cargoItem: CargoShipment) => {
    await saveDocument(COLLECTIONS.CARGO, cargoItem);
    setCargo(prev => {
      const idx = prev.findIndex(c => c.id === cargoItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = cargoItem;
        return copy;
      }
      return [cargoItem, ...prev];
    });
    showToast(`Resi Muatan ${cargoItem.billOfLadingNumber} berhasil diupdate.`);
  };

  const handleDeleteCargo = async (cargoId: string) => {
    await deleteDocument(COLLECTIONS.CARGO, cargoId);
    setCargo(prev => prev.filter(c => c.id !== cargoId));
    showToast('Transaksi muatan kargo berhasil dihapus.');
  };

  // CRUD Handlers for Passenger Tickets
  const handleSaveTicket = async (ticket: PassengerTicket) => {
    await saveDocument(COLLECTIONS.TICKETS, ticket);
    setTickets(prev => {
      const idx = prev.findIndex(t => t.id === ticket.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = ticket;
        return copy;
      }
      return [ticket, ...prev];
    });
    showToast(`Tiket ${ticket.ticketNumber} penumpang ${ticket.passengerName} berhasil disimpan.`);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    await deleteDocument(COLLECTIONS.TICKETS, ticketId);
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    showToast('Tiket penumpang berhasil dibatalkan & dihapus.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isCloudConnected={isCloudConnected}
        onSyncDb={handleRefreshData}
        isSyncing={isSyncing}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* Main Body Layout */}
      <div className="flex">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          counts={{
            ships: ships.length,
            routes: routes.length,
            schedules: schedules.length,
            cargo: cargo.length,
            tickets: tickets.length
          }}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-cyan-400/40 flex items-center space-x-2 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Dynamic Component Switching */}
          {activeView === 'dashboard' && (
            <Dashboard
              ships={ships}
              routes={routes}
              schedules={schedules}
              cargo={cargo}
              tickets={tickets}
              onSelectView={setActiveView}
              onOpenNewCargo={() => setActiveView('trans_cargo')}
              onOpenNewTicket={() => setActiveView('trans_passengers')}
              onViewCargoDetail={(c) => setSelectedCargoForBL(c)}
              onViewTicketDetail={(t) => setSelectedTicketForPrint(t)}
            />
          )}

          {activeView === 'master_ships' && (
            <ShipsMaster
              ships={ships}
              onSaveShip={handleSaveShip}
              onDeleteShip={handleDeleteShip}
              isLoading={isSyncing}
            />
          )}

          {activeView === 'master_routes' && (
            <RoutesMaster
              routes={routes}
              onSaveRoute={handleSaveRoute}
              onDeleteRoute={handleDeleteRoute}
              isLoading={isSyncing}
            />
          )}

          {activeView === 'master_tariffs' && (
            <TariffsMaster
              routes={routes}
            />
          )}

          {activeView === 'trans_cargo' && (
            <CargoTransactions
              cargoList={cargo}
              schedules={schedules}
              routes={routes}
              onSaveCargo={handleSaveCargo}
              onDeleteCargo={handleDeleteCargo}
              onPrintBL={(c) => setSelectedCargoForBL(c)}
              isLoading={isSyncing}
            />
          )}

          {activeView === 'trans_passengers' && (
            <PassengerTransactions
              tickets={tickets}
              schedules={schedules}
              routes={routes}
              onSaveTicket={handleSaveTicket}
              onDeleteTicket={handleDeleteTicket}
              onPrintTicket={(t) => setSelectedTicketForPrint(t)}
              isLoading={isSyncing}
            />
          )}

          {activeView === 'trans_schedules' && (
            <SchedulesManager
              schedules={schedules}
              ships={ships}
              routes={routes}
              onSaveSchedule={handleSaveSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              isLoading={isSyncing}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              ships={ships}
              routes={routes}
              schedules={schedules}
              cargo={cargo}
              tickets={tickets}
            />
          )}

          {activeView === 'database_sync' && (
            <DatabaseSyncView
              ships={ships}
              routes={routes}
              schedules={schedules}
              cargo={cargo}
              tickets={tickets}
              onRefreshData={handleRefreshData}
              isSyncing={isSyncing}
            />
          )}

        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Bill of Lading Printable Modal */}
      <BillOfLadingModal
        cargo={selectedCargoForBL}
        onClose={() => setSelectedCargoForBL(null)}
      />

      {/* Passenger Boarding Pass Printable Modal */}
      <BoardingPassModal
        ticket={selectedTicketForPrint}
        onClose={() => setSelectedTicketForPrint(null)}
      />

    </div>
  );
}
