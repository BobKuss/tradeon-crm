import type { AuthUser, Company, Contact, Deal, Invoice, Task, Vehicle } from './types';

// ─── Staff ────────────────────────────────────────────────────────────────────

export const MOCK_STAFF: AuthUser[] = [
  { id: 'S1', name: 'Kenan Pektas',      initials: 'KP', role: 'Sales Director',    authRole: 'admin',   color: '#A21A19', email: 'kenan.pektas@tradeon.es' },
  { id: 'S2', name: 'Martin Zimmermann', initials: 'MZ', role: 'Marketing Director', authRole: 'sales',   color: '#333838', email: 'martin.zimmermann@tradeon.es' },
  { id: 'S3', name: 'Laura García',      initials: 'LG', role: 'Sales Manager',      authRole: 'sales',   color: '#2563EB', email: 'laura.garcia@tradeon.es' },
  { id: 'S4', name: 'David Santos',      initials: 'DS', role: 'Finance Manager',    authRole: 'finance', color: '#16A34A', email: 'david.santos@tradeon.es' },
];

export const MOCK_DEMO_USER: AuthUser = MOCK_STAFF[0];

// ─── Companies ────────────────────────────────────────────────────────────────

export const MOCK_COMPANIES: Company[] = [
  { id: 'C01', name: 'Hoffmann Fleet GmbH',    country: 'Germany',     city: 'Munich',      status: 'active',   segment: 'enterprise', creditLimit: 200000, balance: 45200,  lastActivityAt: '2026-04-11', assignedUserId: 'S1', createdAt: '2025-01-10T00:00:00Z', updatedAt: '2026-04-11T00:00:00Z' },
  { id: 'C02', name: 'Laurent Automobiles',    country: 'France',      city: 'Lyon',        status: 'active',   segment: 'mid_market', creditLimit: 80000,  balance: 12400,  lastActivityAt: '2026-04-10', assignedUserId: 'S1', createdAt: '2025-02-15T00:00:00Z', updatedAt: '2026-04-10T00:00:00Z' },
  { id: 'C03', name: 'EV Nordic Fleet',        country: 'Denmark',     city: 'Copenhagen',  status: 'active',   segment: 'enterprise', creditLimit: 150000, balance: 38800,  lastActivityAt: '2026-04-12', assignedUserId: 'S3', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-04-12T00:00:00Z' },
  { id: 'C04', name: 'UK Trade Vehicles Ltd',  country: 'UK',          city: 'Birmingham',  status: 'active',   segment: 'mid_market', creditLimit: 100000, balance: 6700,   lastActivityAt: '2026-04-08', assignedUserId: 'S3', createdAt: '2025-03-20T00:00:00Z', updatedAt: '2026-04-08T00:00:00Z' },
  { id: 'C05', name: 'Pannonia Auto Kft',      country: 'Hungary',     city: 'Budapest',    status: 'inactive', segment: 'smb',        creditLimit: 40000,  balance: 0,      lastActivityAt: '2026-03-15', assignedUserId: 'S1', createdAt: '2025-04-05T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z' },
  { id: 'C06', name: 'Ferretti Auto SRL',      country: 'Italy',       city: 'Milan',       status: 'active',   segment: 'mid_market', creditLimit: 75000,  balance: 22100,  lastActivityAt: '2026-04-09', assignedUserId: 'S3', createdAt: '2025-05-10T00:00:00Z', updatedAt: '2026-04-09T00:00:00Z' },
  { id: 'C07', name: 'Central Auto Trading',   country: 'Belgium',     city: 'Brussels',    status: 'active',   segment: 'enterprise', creditLimit: 120000, balance: 15600,  lastActivityAt: '2026-04-11', assignedUserId: 'S1', createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-04-11T00:00:00Z' },
  { id: 'C08', name: 'MotorPrime BV',          country: 'Netherlands', city: 'Amsterdam',   status: 'active',   segment: 'mid_market', creditLimit: 90000,  balance: 31200,  lastActivityAt: '2026-04-07', assignedUserId: 'S3', createdAt: '2025-06-15T00:00:00Z', updatedAt: '2026-04-07T00:00:00Z' },
  { id: 'C09', name: 'Nordic Premium Cars AB', country: 'Sweden',      city: 'Gothenburg',  status: 'active',   segment: 'enterprise', creditLimit: 180000, balance: 55000,  lastActivityAt: '2026-04-12', assignedUserId: 'S1', createdAt: '2025-07-01T00:00:00Z', updatedAt: '2026-04-12T00:00:00Z' },
  { id: 'C10', name: 'AutoVista Poland',       country: 'Poland',      city: 'Warsaw',      status: 'active',   segment: 'smb',        creditLimit: 35000,  balance: 8900,   lastActivityAt: '2026-04-05', assignedUserId: 'S3', createdAt: '2025-08-10T00:00:00Z', updatedAt: '2026-04-05T00:00:00Z' },
];

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const MOCK_CONTACTS: Contact[] = [
  { id: 'P01', companyId: 'C01', name: 'Markus Hoffmann',  role: 'CEO',              email: 'mhoffmann@hoffmannfleet.de',      phone: '+49 89 123 4001', isPrimary: true,  createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: 'P02', companyId: 'C01', name: 'Klaus Bauer',      role: 'Fleet Manager',    email: 'kbauer@hoffmannfleet.de',         phone: '+49 89 123 4002', isPrimary: false, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: 'P03', companyId: 'C02', name: 'Sophie Laurent',   role: 'Purchasing Dir.',  email: 'slaurent@laurentauto.fr',         phone: '+33 4 5678 9012', isPrimary: true,  createdAt: '2025-02-15T00:00:00Z', updatedAt: '2025-02-15T00:00:00Z' },
  { id: 'P04', companyId: 'C03', name: 'Lars Nielsen',     role: 'Fleet Director',   email: 'lnielsen@evnordic.dk',            phone: '+45 33 123 456',  isPrimary: true,  createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
  { id: 'P05', companyId: 'C03', name: 'Anna Kristensen',  role: 'Finance Manager',  email: 'akristensen@evnordic.dk',         phone: '+45 33 123 457',  isPrimary: false, createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
  { id: 'P06', companyId: 'C04', name: 'James Thompson',   role: 'MD',               email: 'jthompson@uktradevehicles.co.uk', phone: '+44 121 555 0100',isPrimary: true,  createdAt: '2025-03-20T00:00:00Z', updatedAt: '2025-03-20T00:00:00Z' },
  { id: 'P07', companyId: 'C05', name: 'Péter Kovács',     role: 'Owner',            email: 'pkovacs@pannoniauto.hu',          phone: '+36 1 234 5678',  isPrimary: true,  createdAt: '2025-04-05T00:00:00Z', updatedAt: '2025-04-05T00:00:00Z' },
  { id: 'P08', companyId: 'C06', name: 'Giorgio Ferretti', role: 'CEO',              email: 'gferretti@ferrettiauto.it',       phone: '+39 02 1234 5678',isPrimary: true,  createdAt: '2025-05-10T00:00:00Z', updatedAt: '2025-05-10T00:00:00Z' },
  { id: 'P09', companyId: 'C07', name: 'Marc Dubois',      role: 'Sales Director',   email: 'mdubois@centralautobe.com',       phone: '+32 2 123 4567',  isPrimary: true,  createdAt: '2025-06-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'P10', companyId: 'C08', name: 'Pieter van Dam',   role: 'Fleet Manager',    email: 'pvdam@motorprimebv.nl',           phone: '+31 20 123 4567', isPrimary: true,  createdAt: '2025-06-15T00:00:00Z', updatedAt: '2025-06-15T00:00:00Z' },
  { id: 'P11', companyId: 'C09', name: 'Erik Lindqvist',   role: 'CEO',              email: 'elindqvist@nordicpremium.se',     phone: '+46 31 123 456',  isPrimary: true,  createdAt: '2025-07-01T00:00:00Z', updatedAt: '2025-07-01T00:00:00Z' },
  { id: 'P12', companyId: 'C09', name: 'Anna Svensson',    role: 'Purchasing Mgr.',  email: 'asvensson@nordicpremium.se',      phone: '+46 31 123 457',  isPrimary: false, createdAt: '2025-07-01T00:00:00Z', updatedAt: '2025-07-01T00:00:00Z' },
  { id: 'P13', companyId: 'C10', name: 'Tomasz Kowalski',  role: 'Operations Dir.',  email: 'tkowalski@autovista.pl',          phone: '+48 22 123 4567', isPrimary: true,  createdAt: '2025-08-10T00:00:00Z', updatedAt: '2025-08-10T00:00:00Z' },
];

// ─── Deals ────────────────────────────────────────────────────────────────────

export const MOCK_DEALS: Deal[] = [
  { id: 'TRD-2026-0001', companyId: 'C01', contactId: 'P01', assignedUserId: 'S1', subject: 'Request for 5x BMW 5 Series – Q2 Fleet Order',      channel: 'email',  status: 'in_progress', priority: 'high',   vehicleRef: 'BMW 5 Series 520d',       createdAt: '2026-04-10T08:23:00Z', updatedAt: '2026-04-10T14:12:00Z' },
  { id: 'TRD-2026-0002', companyId: 'C03', contactId: 'P04', assignedUserId: 'S3', subject: 'Tesla Model Y batch – 10 units EV fleet',            channel: 'portal', status: 'new',         priority: 'high',   vehicleRef: 'Tesla Model Y LR AWD',    createdAt: '2026-04-12T07:15:00Z', updatedAt: '2026-04-12T07:15:00Z' },
  { id: 'TRD-2026-0003', companyId: 'C02', contactId: 'P03', assignedUserId: 'S1', subject: 'Audi A6 Avant availability for French import',        channel: 'email',  status: 'awaiting',    priority: 'medium', vehicleRef: 'Audi A6 Avant 45 TDI',    createdAt: '2026-04-08T11:00:00Z', updatedAt: '2026-04-09T09:00:00Z' },
  { id: 'TRD-2026-0004', companyId: 'C09', contactId: 'P11', assignedUserId: 'S1', subject: 'Volvo XC90 – 3 units for Stockholm resale',           channel: 'email',  status: 'in_progress', priority: 'medium', vehicleRef: 'Volvo XC90 B5',            createdAt: '2026-04-09T09:45:00Z', updatedAt: '2026-04-09T11:20:00Z' },
  { id: 'TRD-2026-0005', companyId: 'C06', contactId: 'P08', assignedUserId: 'S3', subject: 'Mercedes E-Class inquiry – Italian market',           channel: 'portal', status: 'new',         priority: 'medium', vehicleRef: 'Mercedes E 300 AMG Line',  createdAt: '2026-04-11T15:30:00Z', updatedAt: '2026-04-11T15:30:00Z' },
  { id: 'TRD-2026-0006', companyId: 'C07', contactId: 'P09', assignedUserId: 'S1', subject: 'VW Transporter fleet – 8 units',                     channel: 'email',  status: 'resolved',    priority: 'high',   vehicleRef: 'VW T6.1 Transporter',      createdAt: '2026-03-25T10:00:00Z', updatedAt: '2026-03-26T09:00:00Z' },
  { id: 'TRD-2026-0007', companyId: 'C04', contactId: 'P06', assignedUserId: 'S3', subject: 'Ford Transit price negotiation',                      channel: 'email',  status: 'awaiting',    priority: 'low',    vehicleRef: 'Ford Transit Custom',      createdAt: '2026-04-07T13:20:00Z', updatedAt: '2026-04-08T09:00:00Z' },
  { id: 'TRD-2026-0008', companyId: 'C08', contactId: 'P10', assignedUserId: 'S3', subject: 'Invoice dispute – INV-2026-0045',                    channel: 'portal', status: 'in_progress', priority: 'high',   vehicleRef: '',                         createdAt: '2026-04-10T16:00:00Z', updatedAt: '2026-04-11T09:30:00Z' },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const MOCK_TASKS: Task[] = [
  { id: 'T01', title: 'Send fleet quote – 5x BMW 5 Series',        description: 'Prepare and send fleet quote to Hoffmann Fleet GmbH including delivery to Munich', status: 'open',        dueAt: '2026-04-15', dealId: 'TRD-2026-0001', companyName: 'Hoffmann Fleet GmbH',    assignedUserId: 'S1', createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-04-10T09:00:00Z' },
  { id: 'T02', title: 'Provide battery health reports – Tesla Model Y', description: 'Send battery condition reports for all 10 Model Y units to EV Nordic Fleet',    status: 'open',        dueAt: '2026-04-14', dealId: 'TRD-2026-0002', companyName: 'EV Nordic Fleet',        assignedUserId: 'S3', createdAt: '2026-04-12T08:00:00Z', updatedAt: '2026-04-12T08:00:00Z' },
  { id: 'T03', title: 'Send purchase agreement – Audi A6 Avant',    description: 'Prepare and send purchase agreement for French import to Laurent Automobiles',     status: 'open',        dueAt: '2026-04-14', dealId: 'TRD-2026-0003', companyName: 'Laurent Automobiles',    assignedUserId: 'S1', createdAt: '2026-04-09T10:00:00Z', updatedAt: '2026-04-09T10:00:00Z' },
  { id: 'T04', title: 'Reserve Volvo XC90 units – Nordic Premium',  description: 'Confirm reservation of 2 additional XC90 units arriving in 2 weeks',              status: 'in_progress', dueAt: '2026-04-16', dealId: 'TRD-2026-0004', companyName: 'Nordic Premium Cars AB', assignedUserId: 'S1', createdAt: '2026-04-09T11:30:00Z', updatedAt: '2026-04-10T09:00:00Z' },
  { id: 'T05', title: 'Review invoice dispute INV-2026-0045',        description: 'Investigate price discrepancy (€38,900 vs €37,500) with finance team',            status: 'in_progress', dueAt: '2026-04-13', dealId: 'TRD-2026-0008', companyName: 'MotorPrime BV',          assignedUserId: 'S3', createdAt: '2026-04-10T16:30:00Z', updatedAt: '2026-04-11T09:45:00Z' },
  { id: 'T06', title: 'Schedule Mercedes inspection – Ferretti Auto', description: 'Confirm April 18th or 25th inspection date for Mercedes E300 AMG Line',         status: 'open',        dueAt: '2026-04-15', dealId: 'TRD-2026-0005', companyName: 'Ferretti Auto SRL',      assignedUserId: 'S3', createdAt: '2026-04-11T16:00:00Z', updatedAt: '2026-04-11T16:00:00Z' },
  { id: 'T07', title: 'Prepare Audi A4 purchase agreements × 3',    description: 'Send 3x Audi A4 Avant purchase agreements to Central Auto Trading finance',       status: 'open',        dueAt: '2026-04-13', dealId: undefined,       companyName: 'Central Auto Trading',  assignedUserId: 'S1', createdAt: '2026-04-10T12:00:00Z', updatedAt: '2026-04-10T12:00:00Z' },
  { id: 'T08', title: 'Confirm Ford Transit payment receipt',        description: 'Confirm receipt of wire transfer from UK Trade Vehicles and arrange collection',  status: 'done',        dueAt: '2026-04-10', dealId: 'TRD-2026-0007', companyName: 'UK Trade Vehicles Ltd',  assignedUserId: 'S3', createdAt: '2026-04-09T16:00:00Z', updatedAt: '2026-04-10T10:00:00Z' },
  { id: 'T09', title: 'Follow up VW Golf batch – AutoVista Poland',  description: 'Respond to VW Golf R-Line batch inquiry with available stock and fleet pricing', status: 'open',        dueAt: '2026-04-17', dealId: undefined,       companyName: 'AutoVista Poland',       assignedUserId: 'S3', createdAt: '2026-04-09T11:00:00Z', updatedAt: '2026-04-09T11:00:00Z' },
  { id: 'T10', title: 'Overdue invoice escalation – Ferretti Auto',  description: 'Escalate overdue INV-2026-0046 (€47,200) to finance manager',                    status: 'done',        dueAt: '2026-04-11', dealId: undefined,       companyName: 'Ferretti Auto SRL',      assignedUserId: 'S4', createdAt: '2026-04-11T08:00:00Z', updatedAt: '2026-04-11T09:00:00Z' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStaffById(id: string): AuthUser | undefined {
  return MOCK_STAFF.find(s => s.id === id);
}

export function getCompanyById(id: string): Company | undefined {
  return MOCK_COMPANIES.find(c => c.id === id);
}

export function getContactsByCompany(companyId: string): Contact[] {
  return MOCK_CONTACTS.filter(c => c.companyId === companyId);
}

export function getDealsByCompany(companyId: string): Deal[] {
  return MOCK_DEALS.filter(d => d.companyId === companyId);
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'V01', stockNumber: 'STO-2024-001', vin: 'WBA11CF080GX00001', make: 'BMW',          model: '5 Series',  variant: '520d xDrive',          year: 2023, mileage: 18400, fuelType: 'diesel',   transmission: 'automatic', color: 'Alpine White',       price: 42500, currency: 'EUR', status: 'available', location: 'Madrid Depot',    description: 'Full service history. Parking sensors, heated seats, LED headlights.', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-04-10T00:00:00Z' },
  { id: 'V02', stockNumber: 'STO-2024-002', vin: 'WVWZZZ3CZPE000002', make: 'Volkswagen',   model: 'Passat',    variant: '2.0 TDI Business',     year: 2022, mileage: 34100, fuelType: 'diesel',   transmission: 'automatic', color: 'Deep Black Pearl',   price: 28900, currency: 'EUR', status: 'available', location: 'Barcelona Hub',   description: 'One owner. Navigation, adaptive cruise control.',                      createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-04-09T00:00:00Z' },
  { id: 'V03', stockNumber: 'STO-2024-003', vin: 'YV1XZ751BE000003',  make: 'Volvo',        model: 'XC60',      variant: 'B4 AWD Inscription',   year: 2023, mileage:  9200, fuelType: 'hybrid',   transmission: 'automatic', color: 'Crystal White',      price: 51800, currency: 'EUR', status: 'reserved',  location: 'Madrid Depot',    description: 'Mild hybrid. Panoramic roof, Bowers & Wilkins audio, 7-year warranty.',createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-04-12T00:00:00Z' },
  { id: 'V04', stockNumber: 'STO-2024-004',                            make: 'Mercedes-Benz',model: 'E-Class',   variant: 'E220d AMG Line',       year: 2021, mileage: 62000, fuelType: 'diesel',   transmission: 'automatic', color: 'Obsidian Black',     price: 34200, currency: 'EUR', status: 'available', location: 'Valencia Store',  description: 'AMG body kit, Burmester sound, 360 camera.',                           createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-04-08T00:00:00Z' },
  { id: 'V05', stockNumber: 'STO-2024-005', vin: 'WAUZZZ4G7KN000005', make: 'Audi',         model: 'A4',        variant: '35 TDI S Line',        year: 2022, mileage: 41300, fuelType: 'diesel',   transmission: 'automatic', color: 'Chronos Grey',       price: 31500, currency: 'EUR', status: 'sold',      location: 'Barcelona Hub',   description: 'S line package, virtual cockpit, Matrix LED.',                         createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-04-11T00:00:00Z' },
  { id: 'V06', stockNumber: 'STO-2024-006', vin: 'TMBJP7NS5N3000006', make: 'Skoda',        model: 'Octavia',   variant: '2.0 TDI Style',        year: 2023, mileage:  5500, fuelType: 'diesel',   transmission: 'manual',    color: 'Race Blue',          price: 26800, currency: 'EUR', status: 'available', location: 'Madrid Depot',    description: 'Nearly new, full manufacturer warranty remaining.',                     createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-04-07T00:00:00Z' },
  { id: 'V07', stockNumber: 'STO-2024-007',                            make: 'Tesla',        model: 'Model 3',   variant: 'Long Range AWD',       year: 2022, mileage: 28700, fuelType: 'electric', transmission: 'automatic', color: 'Midnight Silver',    price: 44900, currency: 'EUR', status: 'available', location: 'Barcelona Hub',   description: '579km WLTP range. Enhanced autopilot, glass roof.',                    createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-04-10T00:00:00Z' },
  { id: 'V08', stockNumber: 'STO-2024-008',                            make: 'Toyota',       model: 'RAV4',      variant: 'Plug-in Hybrid',       year: 2023, mileage: 11200, fuelType: 'phev',     transmission: 'automatic', color: 'Pearl White',        price: 47200, currency: 'EUR', status: 'draft',     location: 'Madrid Depot',    description: 'Under inspection. 75km electric range. All-wheel drive.',              createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-04-13T00:00:00Z' },
  { id: 'V09', stockNumber: 'STO-2023-091',                            make: 'Ford',         model: 'Focus',     variant: '1.0 EcoBoost ST-Line', year: 2021, mileage: 55000, fuelType: 'petrol',   transmission: 'manual',    color: 'Frozen White',       price: 18400, currency: 'EUR', status: 'archived',  location: 'Valencia Store',  description: 'Archived — sold externally before listing.',                           createdAt: '2025-11-01T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z' },
  { id: 'V10', stockNumber: 'STO-2024-010', vin: 'WVGZZZ5NZLW000010', make: 'Volkswagen',   model: 'Tiguan',    variant: '2.0 TDI 4Motion R-Line',year: 2023, mileage: 14800, fuelType: 'diesel',  transmission: 'automatic', color: 'Lapiz Blue',         price: 39900, currency: 'EUR', status: 'available', location: 'Madrid Depot',    description: 'R-Line exterior, digital cockpit pro, travel assist.',                 createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-04-12T00:00:00Z' },
];

export function getVehicleById(id: string): Vehicle | undefined {
  return MOCK_VEHICLES.find(v => v.id === id);
}

// ─── Invoices (VeriFactu mock) ────────────────────────────────────────────────

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0041', companyId: 'C01', description: 'BMW 5 Series 520d × 5',
    amount: 162500, currency: 'EUR', status: 'paid',
    issuedAt: '2026-03-20', dueAt: '2026-04-19', paidAt: '2026-04-10',
    serie: 'A', numero: 41, tipoFactura: 'F1',
    baseImponible: 134297.52, tipoIVA: 21, cuotaIVA: 28202.48,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'DE812345678', nombreDestinatario: 'Hoffmann Fleet GmbH',
    estadoVeriFactu: 'aceptada',
    csvAeat: 'CSV-A41-2026-X7K9M2P', fechaEnvioAeat: '2026-03-20T09:15:00Z',
    huella: 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    huellaAnterior: '0000000000000000000000000000000000000000000000000000000000000000',
    company: { id: 'C01', name: 'Hoffmann Fleet GmbH', country: 'Germany' },
    createdAt: '2026-03-20T09:00:00Z', updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'INV-2026-0042', companyId: 'C01', description: 'Fleet management fee Q1 2026',
    amount: 3200, currency: 'EUR', status: 'paid',
    issuedAt: '2026-03-01', dueAt: '2026-03-31', paidAt: '2026-03-28',
    serie: 'A', numero: 42, tipoFactura: 'F1',
    baseImponible: 2644.63, tipoIVA: 21, cuotaIVA: 555.37,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'DE812345678', nombreDestinatario: 'Hoffmann Fleet GmbH',
    estadoVeriFactu: 'aceptada',
    csvAeat: 'CSV-A42-2026-L3N8Q1R', fechaEnvioAeat: '2026-03-01T10:00:00Z',
    huella: 'b4c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    huellaAnterior: 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    company: { id: 'C01', name: 'Hoffmann Fleet GmbH', country: 'Germany' },
    createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-28T00:00:00Z',
  },
  {
    id: 'INV-2026-0043', companyId: 'C01', description: 'Transport & logistics – March',
    amount: 4800, currency: 'EUR', status: 'overdue',
    issuedAt: '2026-03-15', dueAt: '2026-04-14', paidAt: null,
    serie: 'A', numero: 43, tipoFactura: 'F1',
    baseImponible: 3966.94, tipoIVA: 21, cuotaIVA: 833.06,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'DE812345678', nombreDestinatario: 'Hoffmann Fleet GmbH',
    estadoVeriFactu: 'aceptada',
    csvAeat: 'CSV-A43-2026-W5T2V9Y', fechaEnvioAeat: '2026-03-15T11:30:00Z',
    huella: 'c5d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    huellaAnterior: 'b4c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    company: { id: 'C01', name: 'Hoffmann Fleet GmbH', country: 'Germany' },
    createdAt: '2026-03-15T11:00:00Z', updatedAt: '2026-04-14T00:00:00Z',
  },
  {
    id: 'INV-2026-0044', companyId: 'C03', description: 'Tesla Model Y LR AWD × 4',
    amount: 124000, currency: 'EUR', status: 'paid',
    issuedAt: '2026-03-10', dueAt: '2026-04-09', paidAt: '2026-04-05',
    serie: 'A', numero: 44, tipoFactura: 'F1',
    baseImponible: 102479.34, tipoIVA: 21, cuotaIVA: 21520.66,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'DK29372551', nombreDestinatario: 'EV Nordic Fleet ApS',
    estadoVeriFactu: 'aceptada',
    csvAeat: 'CSV-A44-2026-H8J4K6M', fechaEnvioAeat: '2026-03-10T08:45:00Z',
    huella: 'd6e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    huellaAnterior: 'c5d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    company: { id: 'C03', name: 'EV Nordic Fleet', country: 'Denmark' },
    createdAt: '2026-03-10T08:00:00Z', updatedAt: '2026-04-05T00:00:00Z',
  },
  {
    id: 'INV-2026-0045', companyId: 'C03', description: 'Battery health assessment × 4',
    amount: 2400, currency: 'EUR', status: 'issued',
    issuedAt: '2026-04-12', dueAt: '2026-05-12', paidAt: null,
    serie: 'A', numero: 45, tipoFactura: 'F1',
    baseImponible: 1983.47, tipoIVA: 21, cuotaIVA: 416.53,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'DK29372551', nombreDestinatario: 'EV Nordic Fleet ApS',
    estadoVeriFactu: 'pendiente',
    company: { id: 'C03', name: 'EV Nordic Fleet', country: 'Denmark' },
    createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'INV-2026-0046', companyId: 'C08', description: 'Mercedes E 300 × 2',
    amount: 77800, currency: 'EUR', status: 'disputed',
    issuedAt: '2026-03-28', dueAt: '2026-04-27', paidAt: null,
    serie: 'A', numero: 46, tipoFactura: 'F1',
    baseImponible: 64297.52, tipoIVA: 21, cuotaIVA: 13502.48,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'NL855234107B01', nombreDestinatario: 'MotorPrime BV',
    estadoVeriFactu: 'aceptada',
    csvAeat: 'CSV-A46-2026-P2R7S4U', fechaEnvioAeat: '2026-03-28T14:20:00Z',
    huella: 'f8a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    huellaAnterior: 'e7f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    company: { id: 'C08', name: 'MotorPrime BV', country: 'Netherlands' },
    createdAt: '2026-03-28T14:00:00Z', updatedAt: '2026-03-28T14:20:00Z',
  },
  {
    id: 'INV-2026-0047', companyId: 'C09', description: 'Volvo XC60 T8 × 3',
    amount: 54200, currency: 'SEK', status: 'paid',
    issuedAt: '2026-03-20', dueAt: '2026-04-19', paidAt: '2026-04-10',
    serie: 'B', numero: 1, tipoFactura: 'F1',
    baseImponible: 54200, tipoIVA: 0, cuotaIVA: 0,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'SE556789012301', nombreDestinatario: 'Nordic Premium Cars AB',
    estadoVeriFactu: 'aceptada',
    csvAeat: 'CSV-B01-2026-Z1A9C3E', fechaEnvioAeat: '2026-03-20T12:00:00Z',
    huella: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    huellaAnterior: '0000000000000000000000000000000000000000000000000000000000000000',
    company: { id: 'C09', name: 'Nordic Premium Cars AB', country: 'Sweden' },
    createdAt: '2026-03-20T12:00:00Z', updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'INV-2026-0048', companyId: 'C09', description: 'Volvo XC90 B5 × 3 (deposit)',
    amount: 18000, currency: 'SEK', status: 'issued',
    issuedAt: '2026-04-09', dueAt: '2026-05-09', paidAt: null,
    serie: 'B', numero: 2, tipoFactura: 'F1',
    baseImponible: 18000, tipoIVA: 0, cuotaIVA: 0,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'SE556789012301', nombreDestinatario: 'Nordic Premium Cars AB',
    estadoVeriFactu: 'enviada', fechaEnvioAeat: '2026-04-09T13:45:00Z',
    huella: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    huellaAnterior: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    company: { id: 'C09', name: 'Nordic Premium Cars AB', country: 'Sweden' },
    createdAt: '2026-04-09T13:00:00Z', updatedAt: '2026-04-09T13:45:00Z',
  },
  {
    id: 'INV-2026-0049', companyId: 'C07', description: 'VW T6.1 Transporter × 8',
    amount: 216000, currency: 'EUR', status: 'paid',
    issuedAt: '2026-03-26', dueAt: '2026-04-25', paidAt: '2026-04-20',
    serie: 'A', numero: 49, tipoFactura: 'F1',
    baseImponible: 178512.40, tipoIVA: 21, cuotaIVA: 37487.60,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'BE0531697169', nombreDestinatario: 'Central Auto Trading SA',
    estadoVeriFactu: 'aceptada',
    csvAeat: 'CSV-A49-2026-G4H6I8J', fechaEnvioAeat: '2026-03-26T09:30:00Z',
    huella: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    huellaAnterior: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    company: { id: 'C07', name: 'Central Auto Trading', country: 'Belgium' },
    createdAt: '2026-03-26T09:00:00Z', updatedAt: '2026-04-20T00:00:00Z',
  },
  {
    id: 'INV-2026-0050', companyId: 'C02', description: 'Audi A6 Avant 45 TDI × 2',
    amount: 94000, currency: 'EUR', status: 'issued',
    issuedAt: '2026-04-08', dueAt: '2026-05-08', paidAt: null,
    serie: 'A', numero: 50, tipoFactura: 'F1',
    baseImponible: 77685.95, tipoIVA: 21, cuotaIVA: 16314.05,
    nifEmisor: 'B-12345678', nombreEmisor: 'TradEon Europe SL',
    nifDestinatario: 'FR40303265045', nombreDestinatario: 'Laurent Automobiles SARL',
    estadoVeriFactu: 'rechazada', fechaEnvioAeat: '2026-04-08T10:00:00Z',
    respuestaAeat: { codigoError: '1105', descripcionError: 'NIF del destinatario no identificado en el censo de la AEAT' },
    huella: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    huellaAnterior: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    company: { id: 'C02', name: 'Laurent Automobiles', country: 'France' },
    createdAt: '2026-04-08T09:00:00Z', updatedAt: '2026-04-08T10:00:00Z',
  },
];

export function getInvoiceById(id: string): Invoice | undefined {
  return MOCK_INVOICES.find(i => i.id === id);
}

export function getInvoicesByCompany(companyId: string): Invoice[] {
  return MOCK_INVOICES.filter(i => i.companyId === companyId);
}
