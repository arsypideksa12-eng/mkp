import { Ship, Route, Schedule, CargoShipment, PassengerTicket } from '../types';

export interface DatabaseExportData {
  ships: Ship[];
  routes: Route[];
  schedules: Schedule[];
  cargo: CargoShipment[];
  tickets: PassengerTicket[];
}

export function generatePostgreSqlDump(data: DatabaseExportData, target: 'Supabase' | 'Neon DB'): string {
  const timestamp = new Date().toISOString();
  
  return `-- =========================================================
-- ARS LOGISTIC AND PASSENGER SERVICE DATABASE DUMP
-- Target Platform: ${target} (PostgreSQL Compatible)
-- Generated At: ${timestamp}
-- =========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: ships (Master Data Kapal)
CREATE TABLE IF NOT EXISTS ships (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    passenger_capacity INT DEFAULT 0,
    cargo_capacity_tons NUMERIC(10, 2) DEFAULT 0,
    container_teus INT DEFAULT 0,
    speed_knots NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Active',
    captain_name VARCHAR(150),
    year_built INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: routes (Master Data Rute Pelabuhan)
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(100) PRIMARY KEY,
    origin_port VARCHAR(150) NOT NULL,
    destination_port VARCHAR(150) NOT NULL,
    distance_nm NUMERIC(10, 2) NOT NULL,
    estimated_hours NUMERIC(6, 2) NOT NULL,
    base_passenger_fare NUMERIC(15, 2) DEFAULT 0,
    base_cargo_rate_per_ton NUMERIC(15, 2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: schedules (Jadwal Pelayaran Kapal)
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(100) PRIMARY KEY,
    voyage_number VARCHAR(100) NOT NULL,
    ship_id VARCHAR(100) REFERENCES ships(id) ON DELETE SET NULL,
    ship_name VARCHAR(150),
    route_id VARCHAR(100) REFERENCES routes(id) ON DELETE SET NULL,
    origin_port VARCHAR(150),
    destination_port VARCHAR(150),
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled',
    booked_passengers INT DEFAULT 0,
    booked_cargo_tons NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: cargo_shipments (Transaksi Muatan & Kontainer B/L)
CREATE TABLE IF NOT EXISTS cargo_shipments (
    id VARCHAR(100) PRIMARY KEY,
    bill_of_lading_number VARCHAR(100) NOT NULL UNIQUE,
    schedule_id VARCHAR(100),
    ship_name VARCHAR(150),
    voyage_number VARCHAR(100),
    origin_port VARCHAR(150),
    destination_port VARCHAR(150),
    sender_name VARCHAR(150) NOT NULL,
    sender_phone VARCHAR(50),
    sender_address TEXT,
    receiver_name VARCHAR(150) NOT NULL,
    receiver_phone VARCHAR(50),
    receiver_address TEXT,
    cargo_type VARCHAR(100) NOT NULL,
    weight_tons NUMERIC(10, 2) NOT NULL,
    volume_m3 NUMERIC(10, 2),
    container_or_plate_number VARCHAR(100),
    cargo_description TEXT,
    handling_instructions TEXT,
    shipping_fee NUMERIC(15, 2) DEFAULT 0,
    insurance_fee NUMERIC(15, 2) DEFAULT 0,
    port_fee NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'Pending',
    shipment_status VARCHAR(30) DEFAULT 'Booking',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: passenger_tickets (Transaksi Tiket & Boarding Pass)
CREATE TABLE IF NOT EXISTS passenger_tickets (
    id VARCHAR(100) PRIMARY KEY,
    ticket_number VARCHAR(100) NOT NULL UNIQUE,
    schedule_id VARCHAR(100),
    ship_name VARCHAR(150),
    voyage_number VARCHAR(100),
    origin_port VARCHAR(150),
    destination_port VARCHAR(150),
    departure_time TIMESTAMP WITH TIME ZONE,
    passenger_name VARCHAR(150) NOT NULL,
    identity_number VARCHAR(50) NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(50),
    passenger_class VARCHAR(50) NOT NULL,
    seat_or_cabin_number VARCHAR(50),
    fare_amount NUMERIC(15, 2) DEFAULT 0,
    insurance_fee NUMERIC(15, 2) DEFAULT 0,
    port_service_fee NUMERIC(15, 2) DEFAULT 0,
    total_fare NUMERIC(15, 2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'Paid',
    boarding_status VARCHAR(30) DEFAULT 'Booked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- DATA SEEDING (INSERT STATEMENTS)
-- =========================================================

${data.ships.map(s => `INSERT INTO ships (id, name, code, type, passenger_capacity, cargo_capacity_tons, container_teus, speed_knots, status, captain_name, year_built)
VALUES ('${s.id}', '${escapeSql(s.name)}', '${escapeSql(s.code)}', '${escapeSql(s.type)}', ${s.passengerCapacity}, ${s.cargoCapacityTons}, ${s.containerTeus}, ${s.speedKnots}, '${s.status}', '${escapeSql(s.captainName)}', ${s.yearBuilt})
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP;`).join('\n\n')}

${data.routes.map(r => `INSERT INTO routes (id, origin_port, destination_port, distance_nm, estimated_hours, base_passenger_fare, base_cargo_rate_per_ton, status)
VALUES ('${r.id}', '${escapeSql(r.originPort)}', '${escapeSql(r.destinationPort)}', ${r.distanceNm}, ${r.estimatedHours}, ${r.basePassengerFare}, ${r.baseCargoRatePerTon}, '${r.status}')
ON CONFLICT (id) DO UPDATE SET base_cargo_rate_per_ton = EXCLUDED.base_cargo_rate_per_ton;`).join('\n\n')}

${data.schedules.map(sc => `INSERT INTO schedules (id, voyage_number, ship_id, ship_name, route_id, origin_port, destination_port, departure_time, arrival_time, status, booked_passengers, booked_cargo_tons)
VALUES ('${sc.id}', '${escapeSql(sc.voyageNumber)}', '${sc.shipId}', '${escapeSql(sc.shipName)}', '${sc.routeId}', '${escapeSql(sc.originPort)}', '${escapeSql(sc.destinationPort)}', '${sc.departureTime}', '${sc.arrivalTime}', '${sc.status}', ${sc.bookedPassengers}, ${sc.bookedCargoTons})
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`).join('\n\n')}

${data.cargo.map(c => `INSERT INTO cargo_shipments (id, bill_of_lading_number, schedule_id, ship_name, voyage_number, origin_port, destination_port, sender_name, sender_phone, receiver_name, receiver_phone, cargo_type, weight_tons, container_or_plate_number, cargo_description, total_amount, payment_status, shipment_status)
VALUES ('${c.id}', '${escapeSql(c.billOfLadingNumber)}', '${c.scheduleId}', '${escapeSql(c.shipName)}', '${escapeSql(c.voyageNumber)}', '${escapeSql(c.originPort)}', '${escapeSql(c.destinationPort)}', '${escapeSql(c.senderName)}', '${escapeSql(c.senderPhone)}', '${escapeSql(c.receiverName)}', '${escapeSql(c.receiverPhone)}', '${escapeSql(c.cargoType)}', ${c.weightTons}, '${escapeSql(c.containerOrPlateNumber || '')}', '${escapeSql(c.cargoDescription)}', ${c.totalAmount}, '${c.paymentStatus}', '${c.shipmentStatus}')
ON CONFLICT (id) DO UPDATE SET shipment_status = EXCLUDED.shipment_status;`).join('\n\n')}

${data.tickets.map(t => `INSERT INTO passenger_tickets (id, ticket_number, schedule_id, ship_name, voyage_number, origin_port, destination_port, departure_time, passenger_name, identity_number, gender, phone, passenger_class, seat_or_cabin_number, total_fare, payment_status, boarding_status)
VALUES ('${t.id}', '${escapeSql(t.ticketNumber)}', '${t.scheduleId}', '${escapeSql(t.shipName)}', '${escapeSql(t.voyageNumber)}', '${escapeSql(t.originPort)}', '${escapeSql(t.destinationPort)}', '${t.departureTime}', '${escapeSql(t.passengerName)}', '${escapeSql(t.identityNumber)}', '${t.gender}', '${escapeSql(t.phone)}', '${escapeSql(t.passengerClass)}', '${escapeSql(t.seatOrCabinNumber)}', ${t.totalFare}, '${t.paymentStatus}', '${t.boardingStatus}')
ON CONFLICT (id) DO UPDATE SET boarding_status = EXCLUDED.boarding_status;`).join('\n\n')}
`;
}

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

export function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
