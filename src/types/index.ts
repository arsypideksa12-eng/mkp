export type ShipStatus = 'Active' | 'Docked' | 'Maintenance' | 'Sailing';
export type ShipType = 'Ro-Ro Ferry' | 'Container Ship' | 'Fast Passenger Boat' | 'General Cargo' | 'Bulk Carrier';

export interface Ship {
  id: string;
  name: string;
  code: string;
  type: ShipType;
  passengerCapacity: number;
  cargoCapacityTons: number;
  containerTeus: number;
  speedKnots: number;
  status: ShipStatus;
  captainName: string;
  yearBuilt: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Route {
  id: string;
  originPort: string;
  destinationPort: string;
  distanceNm: number;
  estimatedHours: number;
  basePassengerFare: number;
  baseCargoRatePerTon: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export type ScheduleStatus = 'Scheduled' | 'Boarding' | 'Sailing' | 'Arrived' | 'Delayed' | 'Cancelled';

export interface Schedule {
  id: string;
  voyageNumber: string;
  shipId: string;
  shipName: string;
  routeId: string;
  originPort: string;
  destinationPort: string;
  departureTime: string; // ISO string or datetime-local
  arrivalTime: string;
  status: ScheduleStatus;
  bookedPassengers: number;
  bookedCargoTons: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CargoType = 
  | 'Dry Container 20ft'
  | 'Dry Container 40ft'
  | 'Reefer Cold Container'
  | 'General Cargo (Pallet)'
  | 'Heavy Equipment / Truk'
  | 'Vehicles / Kendaraan'
  | 'Liquid / Bulk';

export type ShipmentStatus = 'Booking' | 'Manifested' | 'Loaded' | 'In Transit' | 'Discharged' | 'Delivered';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Pending';

export interface CargoShipment {
  id: string;
  billOfLadingNumber: string;
  scheduleId: string;
  shipName: string;
  voyageNumber: string;
  originPort: string;
  destinationPort: string;
  senderName: string;
  senderPhone: string;
  senderAddress?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress?: string;
  cargoType: CargoType;
  weightTons: number;
  volumeM3?: number;
  containerOrPlateNumber?: string;
  cargoDescription: string;
  handlingInstructions?: string;
  shippingFee: number;
  insuranceFee: number;
  portFee: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  createdAt: string;
  updatedAt?: string;
}

export type PassengerClass = 'VIP Cabin' | 'Kelas 1' | 'Bisnis AC' | 'Ekonomi Dek';
export type BoardingStatus = 'Booked' | 'Checked-in' | 'Boarded' | 'Completed' | 'Cancelled';

export interface PassengerTicket {
  id: string;
  ticketNumber: string;
  scheduleId: string;
  shipName: string;
  voyageNumber: string;
  originPort: string;
  destinationPort: string;
  departureTime: string;
  passengerName: string;
  identityNumber: string; // KTP / Paspor
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  passengerClass: PassengerClass;
  seatOrCabinNumber: string;
  fareAmount: number;
  insuranceFee: number;
  portServiceFee: number;
  totalFare: number;
  paymentStatus: PaymentStatus;
  boardingStatus: BoardingStatus;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'Super Admin' | 'Harbor Master' | 'Cargo Officer' | 'Ticket Cashier';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
}
