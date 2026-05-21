/**
 * TradEon CRM — Prisma seed
 *
 * Mirrors the mock data from crm/js/data.js so local dev starts with
 * a realistic dataset without manual setup.
 *
 * Run:  pnpm --filter @tradeon/api db:seed
 *    or  cd apps/api && npx ts-node prisma/seed.ts
 */

import {
  CompanySegment,
  CompanyStatus,
  DealChannel,
  DealPriority,
  DealStatus,
  FuelType,
  InteractionDirection,
  InteractionType,
  EstadoVeriFactu,
  InvoiceCurrency,
  InvoiceStatus,
  TipoFactura,
  PrismaClient,
  Role,
  TaskStatus,
  VehicleStatus,
  VehicleTransmission,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('🌱  Seeding TradEon CRM…');

  // ─── Users (staff) ────────────────────────────────────────────────────────
  // Default password for dev seeds: TradEon2026!
  // Admin password:                 Admin1234!
  // Change all passwords via the API before exposing to any network.

  const [devPwHash, adminPwHash] = await Promise.all([
    bcrypt.hash('TradEon2026!', BCRYPT_ROUNDS),
    bcrypt.hash('Admin1234!', BCRYPT_ROUNDS),
  ]);

  const [admin, kenan, martin, laura, david] = await Promise.all([
    // ── Seeded admin account ─────────────────────────────────────────────
    prisma.user.upsert({
      where: { email: 'admin@tradeon.es' },
      update: {},
      create: {
        id: 'S0',
        email: 'admin@tradeon.es',
        name: 'CRM Admin',
        initials: 'CA',
        role: 'Administrator',
        authRole: Role.admin,
        color: '#A21A19',
        passwordHash: adminPwHash,
        updatedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'kenan.pektas@tradeon.es' },
      update: {},
      create: {
        id: 'S1',
        email: 'kenan.pektas@tradeon.es',
        name: 'Kenan Pektas',
        initials: 'KP',
        role: 'Sales Director',
        authRole: Role.sales,
        color: '#A21A19',
        passwordHash: devPwHash,
        updatedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'martin.zimmermann@tradeon.es' },
      update: {},
      create: {
        id: 'S2',
        email: 'martin.zimmermann@tradeon.es',
        name: 'Martin Zimmermann',
        initials: 'MZ',
        role: 'Marketing Director',
        authRole: Role.sales,
        color: '#333838',
        passwordHash: devPwHash,
        updatedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'laura.garcia@tradeon.es' },
      update: {},
      create: {
        id: 'S3',
        email: 'laura.garcia@tradeon.es',
        name: 'Laura García',
        initials: 'LG',
        role: 'Sales Manager',
        authRole: Role.sales,
        color: '#2563EB',
        passwordHash: devPwHash,
        updatedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'david.santos@tradeon.es' },
      update: {},
      create: {
        id: 'S4',
        email: 'david.santos@tradeon.es',
        name: 'David Santos',
        initials: 'DS',
        role: 'Finance Manager',
        authRole: Role.finance,
        color: '#16A34A',
        passwordHash: devPwHash,
        updatedAt: new Date(),
      },
    }),
  ]);

  console.log(`  ✓  ${[admin, kenan, martin, laura, david].length} users (including seeded admin)`);

  // ─── Customer companies ───────────────────────────────────────────────────

  const companySeed = [
    { id: 'C01', name: 'Hoffmann Fleet GmbH',    country: 'Germany',     city: 'Munich',      status: 'active'   as CompanyStatus, segment: 'enterprise' as CompanySegment, creditLimit: 200000, balance: 45200,  assignedUserId: 'S1', lastActivityAt: new Date('2026-04-11') },
    { id: 'C02', name: 'Laurent Automobiles',     country: 'France',      city: 'Lyon',        status: 'active'   as CompanyStatus, segment: 'mid_market' as CompanySegment, creditLimit: 80000,  balance: 12400,  assignedUserId: 'S1', lastActivityAt: new Date('2026-04-10') },
    { id: 'C03', name: 'EV Nordic Fleet',         country: 'Denmark',     city: 'Copenhagen',  status: 'active'   as CompanyStatus, segment: 'enterprise' as CompanySegment, creditLimit: 150000, balance: 38800,  assignedUserId: 'S3', lastActivityAt: new Date('2026-04-12') },
    { id: 'C04', name: 'UK Trade Vehicles Ltd',   country: 'UK',          city: 'Birmingham',  status: 'active'   as CompanyStatus, segment: 'mid_market' as CompanySegment, creditLimit: 100000, balance: 6700,   assignedUserId: 'S3', lastActivityAt: new Date('2026-04-08') },
    { id: 'C05', name: 'Pannonia Auto Kft',       country: 'Hungary',     city: 'Budapest',    status: 'inactive' as CompanyStatus, segment: 'smb'       as CompanySegment, creditLimit: 40000,  balance: 0,      assignedUserId: 'S1', lastActivityAt: new Date('2026-03-15') },
    { id: 'C06', name: 'Ferretti Auto SRL',       country: 'Italy',       city: 'Milan',       status: 'active'   as CompanyStatus, segment: 'mid_market' as CompanySegment, creditLimit: 75000,  balance: 22100,  assignedUserId: 'S3', lastActivityAt: new Date('2026-04-09') },
    { id: 'C07', name: 'Central Auto Trading',    country: 'Belgium',     city: 'Brussels',    status: 'active'   as CompanyStatus, segment: 'enterprise' as CompanySegment, creditLimit: 120000, balance: 15600,  assignedUserId: 'S1', lastActivityAt: new Date('2026-04-11') },
    { id: 'C08', name: 'MotorPrime BV',           country: 'Netherlands', city: 'Amsterdam',   status: 'active'   as CompanyStatus, segment: 'mid_market' as CompanySegment, creditLimit: 90000,  balance: 31200,  assignedUserId: 'S3', lastActivityAt: new Date('2026-04-07') },
    { id: 'C09', name: 'Nordic Premium Cars AB',  country: 'Sweden',      city: 'Gothenburg',  status: 'active'   as CompanyStatus, segment: 'enterprise' as CompanySegment, creditLimit: 180000, balance: 55000,  assignedUserId: 'S1', lastActivityAt: new Date('2026-04-12') },
    { id: 'C10', name: 'AutoVista Poland',        country: 'Poland',      city: 'Warsaw',      status: 'active'   as CompanyStatus, segment: 'smb'       as CompanySegment, creditLimit: 35000,  balance: 8900,   assignedUserId: 'S3', lastActivityAt: new Date('2026-04-05') },
  ];

  for (const c of companySeed) {
    await prisma.customerCompany.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        country: c.country,
        city: c.city,
        status: c.status,
        segment: c.segment,
        creditLimit: c.creditLimit,
        balance: c.balance,
        assignedUserId: c.assignedUserId,
        lastActivityAt: c.lastActivityAt,
        updatedAt: new Date(),
      },
    });
  }

  console.log(`  ✓  ${companySeed.length} customer companies`);

  // ─── Contacts ─────────────────────────────────────────────────────────────

  const contactSeed = [
    { id: 'P01', companyId: 'C01', name: 'Markus Hoffmann',  role: 'CEO',              email: 'mhoffmann@hoffmannfleet.de',         phone: '+49 89 123 4001', isPrimary: true  },
    { id: 'P02', companyId: 'C01', name: 'Klaus Bauer',      role: 'Fleet Manager',    email: 'kbauer@hoffmannfleet.de',             phone: '+49 89 123 4002', isPrimary: false },
    { id: 'P03', companyId: 'C02', name: 'Sophie Laurent',   role: 'Purchasing Dir.',  email: 'slaurent@laurentauto.fr',             phone: '+33 4 5678 9012', isPrimary: true  },
    { id: 'P04', companyId: 'C03', name: 'Lars Nielsen',     role: 'Fleet Director',   email: 'lnielsen@evnordic.dk',                phone: '+45 33 123 456',  isPrimary: true  },
    { id: 'P05', companyId: 'C03', name: 'Anna Kristensen',  role: 'Finance Manager',  email: 'akristensen@evnordic.dk',             phone: '+45 33 123 457',  isPrimary: false },
    { id: 'P06', companyId: 'C04', name: 'James Thompson',   role: 'MD',               email: 'jthompson@uktradevehicles.co.uk',     phone: '+44 121 555 0100',isPrimary: true  },
    { id: 'P07', companyId: 'C05', name: 'Péter Kovács',     role: 'Owner',            email: 'pkovacs@pannoniauto.hu',              phone: '+36 1 234 5678',  isPrimary: true  },
    { id: 'P08', companyId: 'C06', name: 'Giorgio Ferretti', role: 'CEO',              email: 'gferretti@ferrettiauto.it',           phone: '+39 02 1234 5678',isPrimary: true  },
    { id: 'P09', companyId: 'C07', name: 'Marc Dubois',      role: 'Sales Director',   email: 'mdubois@centralautobe.com',           phone: '+32 2 123 4567',  isPrimary: true  },
    { id: 'P10', companyId: 'C08', name: 'Pieter van Dam',   role: 'Fleet Manager',    email: 'pvdam@motorprimebv.nl',               phone: '+31 20 123 4567', isPrimary: true  },
    { id: 'P11', companyId: 'C09', name: 'Erik Lindqvist',   role: 'CEO',              email: 'elindqvist@nordicpremium.se',         phone: '+46 31 123 456',  isPrimary: true  },
    { id: 'P12', companyId: 'C09', name: 'Anna Svensson',    role: 'Purchasing Mgr.',  email: 'asvensson@nordicpremium.se',          phone: '+46 31 123 457',  isPrimary: false },
    { id: 'P13', companyId: 'C10', name: 'Tomasz Kowalski',  role: 'Operations Dir.',  email: 'tkowalski@autovista.pl',              phone: '+48 22 123 4567', isPrimary: true  },
  ];

  for (const p of contactSeed) {
    await prisma.contact.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, updatedAt: new Date() },
    });
  }

  console.log(`  ✓  ${contactSeed.length} contacts`);

  // ─── Vehicles (must come before deals — FK constraint) ───────────────────

  const vehicleSeedEarly: Array<Parameters<typeof prisma.vehicle.upsert>[0]['create']> = [
    { id: 'V01', stockNumber: 'STO-2024-001', vin: 'WBA11CF080GX00001', make: 'BMW', model: '5 Series', variant: '520d xDrive', year: 2023, mileage: 18400, fuelType: FuelType.diesel, transmission: VehicleTransmission.automatic, color: 'Alpine White', price: 42500, currency: 'EUR', status: VehicleStatus.available, location: 'Madrid Depot', description: 'Full service history. Parking sensors, heated seats, LED headlights.' },
    { id: 'V02', stockNumber: 'STO-2024-002', vin: 'WVWZZZ3CZPE000002', make: 'Volkswagen', model: 'Passat', variant: '2.0 TDI Business', year: 2022, mileage: 34100, fuelType: FuelType.diesel, transmission: VehicleTransmission.automatic, color: 'Deep Black Pearl', price: 28900, currency: 'EUR', status: VehicleStatus.available, location: 'Barcelona Hub', description: 'One owner. Navigation, adaptive cruise control.' },
    { id: 'V03', stockNumber: 'STO-2024-003', vin: 'YV1XZ751BE000003', make: 'Volvo', model: 'XC60', variant: 'B4 AWD Inscription', year: 2023, mileage: 9200, fuelType: FuelType.hybrid, transmission: VehicleTransmission.automatic, color: 'Crystal White', price: 51800, currency: 'EUR', status: VehicleStatus.reserved, location: 'Madrid Depot', description: 'Mild hybrid. Panoramic roof, Bowers & Wilkins audio, 7-year warranty.' },
    { id: 'V04', stockNumber: 'STO-2024-004', make: 'Mercedes-Benz', model: 'E-Class', variant: 'E220d AMG Line', year: 2021, mileage: 62000, fuelType: FuelType.diesel, transmission: VehicleTransmission.automatic, color: 'Obsidian Black', price: 34200, currency: 'EUR', status: VehicleStatus.available, location: 'Valencia Store', description: 'AMG body kit, burmester sound system, 360 camera.' },
    { id: 'V05', stockNumber: 'STO-2024-005', vin: 'WAUZZZ4G7KN000005', make: 'Audi', model: 'A4', variant: '35 TDI S Line', year: 2022, mileage: 41300, fuelType: FuelType.diesel, transmission: VehicleTransmission.automatic, color: 'Chronos Grey', price: 31500, currency: 'EUR', status: VehicleStatus.sold, location: 'Barcelona Hub', description: 'S line package, virtual cockpit, Matrix LED.' },
    { id: 'V06', stockNumber: 'STO-2024-006', vin: 'TMBJP7NS5N3000006', make: 'Skoda', model: 'Octavia', variant: '2.0 TDI Style', year: 2023, mileage: 5500, fuelType: FuelType.diesel, transmission: VehicleTransmission.manual, color: 'Race Blue', price: 26800, currency: 'EUR', status: VehicleStatus.available, location: 'Madrid Depot', description: 'Nearly new, full manufacturer warranty remaining.' },
    { id: 'V07', stockNumber: 'STO-2024-007', make: 'Tesla', model: 'Model 3', variant: 'Long Range AWD', year: 2022, mileage: 28700, fuelType: FuelType.electric, transmission: VehicleTransmission.automatic, color: 'Midnight Silver', price: 44900, currency: 'EUR', status: VehicleStatus.available, location: 'Barcelona Hub', description: '579km WLTP range. Enhanced autopilot, glass roof.' },
    { id: 'V08', stockNumber: 'STO-2024-008', make: 'Toyota', model: 'RAV4', variant: 'Plug-in Hybrid', year: 2023, mileage: 11200, fuelType: FuelType.phev, transmission: VehicleTransmission.automatic, color: 'Pearl White', price: 47200, currency: 'EUR', status: VehicleStatus.draft, location: 'Madrid Depot', description: 'Under inspection. 75km electric range. All-wheel drive.' },
    { id: 'V09', stockNumber: 'STO-2023-091', make: 'Ford', model: 'Focus', variant: '1.0 EcoBoost ST-Line', year: 2021, mileage: 55000, fuelType: FuelType.petrol, transmission: VehicleTransmission.manual, color: 'Frozen White', price: 18400, currency: 'EUR', status: VehicleStatus.archived, location: 'Valencia Store', description: 'Archived — sold externally before listing.' },
    { id: 'V10', stockNumber: 'STO-2024-010', vin: 'WVGZZZ5NZLW000010', make: 'Volkswagen', model: 'Tiguan', variant: '2.0 TDI 4Motion R-Line', year: 2023, mileage: 14800, fuelType: FuelType.diesel, transmission: VehicleTransmission.automatic, color: 'Lapiz Blue', price: 39900, currency: 'EUR', status: VehicleStatus.available, location: 'Madrid Depot', description: 'R-Line exterior, digital cockpit pro, travel assist.' },
  ];

  for (const v of vehicleSeedEarly) {
    await prisma.vehicle.upsert({
      where: { stockNumber: v.stockNumber },
      update: {},
      create: { ...v, updatedAt: new Date() },
    });
  }

  console.log(`  ✓  ${vehicleSeedEarly.length} vehicles`);

  // ─── Deals (inquiries) ────────────────────────────────────────────────────

  const dealSeed = [
    { id: 'TRD-2026-0001', companyId: 'C01', contactId: 'P01', assignedUserId: 'S1', subject: 'Request for 5x BMW 5 Series – Q2 Fleet Order',  channel: 'email'  as DealChannel, status: 'in_progress' as DealStatus, priority: 'high'   as DealPriority, vehicleId: 'V01', createdAt: new Date('2026-04-10T08:23:00Z') },
    { id: 'TRD-2026-0002', companyId: 'C03', contactId: 'P04', assignedUserId: 'S3', subject: 'Tesla Model Y batch – 10 units EV fleet',        channel: 'portal' as DealChannel, status: 'new'         as DealStatus, priority: 'high'   as DealPriority, vehicleId: 'V07', createdAt: new Date('2026-04-12T07:15:00Z') },
    { id: 'TRD-2026-0003', companyId: 'C02', contactId: 'P03', assignedUserId: 'S1', subject: 'Audi A6 Avant availability for French import',    channel: 'email'  as DealChannel, status: 'awaiting'    as DealStatus, priority: 'medium' as DealPriority, vehicleId: 'V05', createdAt: new Date('2026-04-08T11:00:00Z') },
    { id: 'TRD-2026-0004', companyId: 'C09', contactId: 'P11', assignedUserId: 'S1', subject: 'Volvo XC90 – 3 units for Stockholm resale',       channel: 'email'  as DealChannel, status: 'in_progress' as DealStatus, priority: 'medium' as DealPriority, vehicleId: 'V03', createdAt: new Date('2026-04-09T09:45:00Z') },
    { id: 'TRD-2026-0005', companyId: 'C06', contactId: 'P08', assignedUserId: 'S3', subject: 'Mercedes E-Class inquiry – Italian market',       channel: 'portal' as DealChannel, status: 'new'         as DealStatus, priority: 'medium' as DealPriority, vehicleId: 'V04', createdAt: new Date('2026-04-11T15:30:00Z') },
    { id: 'TRD-2026-0006', companyId: 'C07', contactId: 'P09', assignedUserId: 'S1', subject: 'VW Transporter fleet – 8 units',                  channel: 'email'  as DealChannel, status: 'resolved'    as DealStatus, priority: 'high'   as DealPriority, vehicleId: 'V02', createdAt: new Date('2026-03-25T10:00:00Z') },
    { id: 'TRD-2026-0007', companyId: 'C04', contactId: 'P06', assignedUserId: 'S3', subject: 'Ford Transit price negotiation',                   channel: 'email'  as DealChannel, status: 'awaiting'    as DealStatus, priority: 'low'    as DealPriority, vehicleId: null,  createdAt: new Date('2026-04-07T13:20:00Z') },
    { id: 'TRD-2026-0008', companyId: 'C08', contactId: 'P10', assignedUserId: 'S3', subject: 'Invoice dispute – INV-2026-0045',                 channel: 'portal' as DealChannel, status: 'in_progress' as DealStatus, priority: 'high'   as DealPriority, vehicleId: null,  createdAt: new Date('2026-04-10T16:00:00Z') },
  ];

  for (const d of dealSeed) {
    await prisma.deal.upsert({
      where: { id: d.id },
      update: {},
      create: { ...d, updatedAt: new Date() },
    });
  }

  console.log(`  ✓  ${dealSeed.length} deals`);

  // ─── Tasks ────────────────────────────────────────────────────────────────

  const taskSeed = [
    { dealId: 'TRD-2026-0001', assignedUserId: 'S1', title: 'Prepare fleet quote for 5x BMW 520d',              status: 'done'        as TaskStatus, dueAt: new Date('2026-04-10T17:00:00Z') },
    { dealId: 'TRD-2026-0001', assignedUserId: 'S1', title: 'Confirm transport cost to Munich',                  status: 'in_progress' as TaskStatus, dueAt: new Date('2026-04-15T12:00:00Z') },
    { dealId: 'TRD-2026-0002', assignedUserId: 'S3', title: 'Compile battery health reports for 10 Model Y units',status: 'open'       as TaskStatus, dueAt: new Date('2026-04-16T09:00:00Z') },
    { dealId: 'TRD-2026-0003', assignedUserId: 'S1', title: 'Send purchase agreement to Laurent Automobiles',    status: 'open'        as TaskStatus, dueAt: new Date('2026-04-14T12:00:00Z') },
    { dealId: 'TRD-2026-0004', assignedUserId: 'S1', title: 'Reserve 2x Volvo XC90 B5 arriving in 2 weeks',     status: 'in_progress' as TaskStatus, dueAt: new Date('2026-04-23T09:00:00Z') },
    { dealId: 'TRD-2026-0005', assignedUserId: 'S3', title: 'Schedule physical inspection – April 18 or 25',    status: 'open'        as TaskStatus, dueAt: new Date('2026-04-14T17:00:00Z') },
    { dealId: 'TRD-2026-0008', assignedUserId: 'S4', title: 'Review INV-2026-0045 with finance – correct amount',status: 'in_progress' as TaskStatus, dueAt: new Date('2026-04-12T17:00:00Z') },
  ];

  for (const t of taskSeed) {
    await prisma.task.create({
      data: { ...t, updatedAt: new Date() },
    });
  }

  console.log(`  ✓  ${taskSeed.length} tasks`);

  // ─── Interactions ─────────────────────────────────────────────────────────

  const interactionSeed: Array<{
    type: InteractionType;
    direction?: InteractionDirection;
    subject?: string;
    body: string;
    companyId: string;
    contactId?: string;
    dealId?: string;
    authorId?: string;
    createdAt: Date;
  }> = [
    // TRD-2026-0001 thread
    { type: 'email', direction: 'inbound',  subject: 'Request for 5x BMW 5 Series – Q2 Fleet Order', body: 'Hello Kenan,\n\nWe are looking to expand our corporate fleet and are very interested in the BMW 5 Series 520d listed on your platform. We need 5 units, preferably with similar specs (diesel, automatic, M Sport). Could you confirm availability and provide a fleet quote including VAT invoices?\n\nBest regards,\nMarkus Hoffmann', companyId: 'C01', contactId: 'P01', dealId: 'TRD-2026-0001', createdAt: new Date('2026-04-10T08:23:00Z') },
    { type: 'email', direction: 'outbound', subject: 'RE: Request for 5x BMW 5 Series – Q2 Fleet Order', body: 'Dear Markus,\n\nThank you for your enquiry. We currently have 3 units matching your requirements in stock and can source 2 additional units within 10 business days. I am preparing a fleet quote for 5 units and will send it over by end of day.\n\nBest regards,\nKenan Pektas', companyId: 'C01', contactId: 'P01', dealId: 'TRD-2026-0001', authorId: 'S1', createdAt: new Date('2026-04-10T10:45:00Z') },
    { type: 'email', direction: 'inbound',  body: 'Perfect, Kenan. We will also need delivery to Munich. Please include transport cost in the quote. Our preferred payment terms are 30 days net.', companyId: 'C01', contactId: 'P01', dealId: 'TRD-2026-0001', createdAt: new Date('2026-04-10T14:12:00Z') },

    // TRD-2026-0002 thread
    { type: 'portal_message', direction: 'inbound', subject: 'Tesla Model Y batch – 10 units EV fleet', body: 'Hi,\n\nWe are converting our entire company fleet to electric vehicles by end of 2026. We need 10 Tesla Model Y Long Range AWD units. Battery health reports are mandatory for us before purchase. Can you confirm stock and provide battery condition for each unit?\n\nRegards, Lars Nielsen', companyId: 'C03', contactId: 'P04', dealId: 'TRD-2026-0002', createdAt: new Date('2026-04-12T07:15:00Z') },

    // TRD-2026-0006 (resolved)
    { type: 'email', direction: 'inbound',  body: 'We need 8 VW Transporters for our logistics operation. Can you supply?', companyId: 'C07', contactId: 'P09', dealId: 'TRD-2026-0006', createdAt: new Date('2026-03-25T10:00:00Z') },
    { type: 'email', direction: 'outbound', body: 'Marc, we can supply 5 units immediately and 3 within 3 weeks. Invoice sent.', companyId: 'C07', contactId: 'P09', dealId: 'TRD-2026-0006', authorId: 'S1', createdAt: new Date('2026-03-25T14:00:00Z') },

    // TRD-2026-0008 dispute
    { type: 'portal_message', direction: 'inbound', subject: 'Invoice dispute – INV-2026-0045', body: 'Hello,\n\nWe believe there is an error on invoice INV-2026-0045. The amount charged is €38,900 but our purchase agreement states €37,500. Please review and issue a corrected invoice.', companyId: 'C08', contactId: 'P10', dealId: 'TRD-2026-0008', createdAt: new Date('2026-04-10T16:00:00Z') },
    { type: 'portal_message', direction: 'outbound', body: 'Dear Pieter, I am reviewing this with our finance team. We will respond within 24 hours.', companyId: 'C08', contactId: 'P10', dealId: 'TRD-2026-0008', authorId: 'S3', createdAt: new Date('2026-04-11T09:30:00Z') },

    // Standalone interactions
    { type: 'email', direction: 'inbound', subject: 'RE: Fleet Quote Q2 2026 – 5x BMW 520d', body: 'Thank you Kenan, we have reviewed the fleet quote. The pricing looks acceptable. We have two questions:\n1. Can you guarantee the identical spec across all 5 units?\n2. Is there a warranty extension option available?\n\nWe would like to proceed as soon as these questions are clarified.\n\nBest, Markus', companyId: 'C01', contactId: 'P01', createdAt: new Date('2026-04-12T14:30:00Z') },
    { type: 'email', direction: 'inbound', subject: 'Payment Confirmation – INV-2026-0041', body: 'Hi,\n\nPlease find attached bank transfer confirmation for invoice INV-2026-0041 (€54,200 for Volvo XC60 T8). Payment reference: NPR-2026-0041-A.\n\nCould you confirm receipt and send the vehicle documentation to our address in Gothenburg?\n\nRegards, Anna Svensson', companyId: 'C09', contactId: 'P12', createdAt: new Date('2026-04-11T16:45:00Z') },

    // Internal notes
    { type: 'note', body: 'Called Erik — confirmed he wants condition reports before signing. Will send via portal by Thursday.', companyId: 'C09', contactId: 'P11', dealId: 'TRD-2026-0004', authorId: 'S1', createdAt: new Date('2026-04-09T12:00:00Z') },
    { type: 'call', body: 'Outbound call to Marc Dubois re: Audi A4 order. Agreed to send invoices to finance@centralautobe.com. Duration: 12 min.', companyId: 'C07', contactId: 'P09', authorId: 'S1', createdAt: new Date('2026-04-09T15:00:00Z') },
  ];

  for (const i of interactionSeed) {
    await prisma.interaction.create({
      data: { ...i, updatedAt: new Date() },
    });
  }

  console.log(`  ✓  ${interactionSeed.length} interactions`);

  // ─── Invoices (VeriFactu) ─────────────────────────────────────────────────
  // Emisor fijo: TradEon Europe SL — NIF B-12345678 (demo)
  // La huella real se recalcula vía el servicio; aquí usamos valores de seed.

  const EMISOR_NIF    = 'B-12345678';
  const EMISOR_NOMBRE = 'TradEon Europe SL';

  type InvoiceSeedRow = {
    id: string; companyId: string; description: string;
    amount: number; currency: InvoiceCurrency; status: InvoiceStatus;
    issuedAt: Date; dueAt: Date; paidAt: Date | null;
    serie: string; numero: number; tipoFactura: TipoFactura;
    baseImponible: number; tipoIVA: number; cuotaIVA: number;
    nifDestinatario?: string; nombreDestinatario?: string;
    estadoVeriFactu: EstadoVeriFactu;
    csvAeat?: string; fechaEnvioAeat?: Date;
    huella?: string; huellaAnterior?: string;
    respuestaAeat?: Record<string, unknown>;
  };

  const invoiceSeed: InvoiceSeedRow[] = [
    // Hoffmann Fleet GmbH (C01) — NIF DE812345678
    {
      id: 'INV-2026-0041', companyId: 'C01',
      description: 'BMW 5 Series 520d × 5',
      amount: 162500, currency: 'EUR', status: 'paid',
      issuedAt: new Date('2026-03-20'), dueAt: new Date('2026-04-19'), paidAt: new Date('2026-04-10'),
      serie: 'A', numero: 41, tipoFactura: 'F1',
      baseImponible: 134297.52, tipoIVA: 21, cuotaIVA: 28202.48,
      nifDestinatario: 'DE812345678', nombreDestinatario: 'Hoffmann Fleet GmbH',
      estadoVeriFactu: 'aceptada',
      csvAeat: 'CSV-A41-2026-X7K9M2P', fechaEnvioAeat: new Date('2026-03-20T09:15:00Z'),
      huella: 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      huellaAnterior: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    {
      id: 'INV-2026-0042', companyId: 'C01',
      description: 'Fleet management fee Q1 2026',
      amount: 3200, currency: 'EUR', status: 'paid',
      issuedAt: new Date('2026-03-01'), dueAt: new Date('2026-03-31'), paidAt: new Date('2026-03-28'),
      serie: 'A', numero: 42, tipoFactura: 'F1',
      baseImponible: 2644.63, tipoIVA: 21, cuotaIVA: 555.37,
      nifDestinatario: 'DE812345678', nombreDestinatario: 'Hoffmann Fleet GmbH',
      estadoVeriFactu: 'aceptada',
      csvAeat: 'CSV-A42-2026-L3N8Q1R', fechaEnvioAeat: new Date('2026-03-01T10:00:00Z'),
      huella: 'b4c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
      huellaAnterior: 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    },
    {
      id: 'INV-2026-0043', companyId: 'C01',
      description: 'Transport & logistics – March',
      amount: 4800, currency: 'EUR', status: 'overdue',
      issuedAt: new Date('2026-03-15'), dueAt: new Date('2026-04-14'), paidAt: null,
      serie: 'A', numero: 43, tipoFactura: 'F1',
      baseImponible: 3966.94, tipoIVA: 21, cuotaIVA: 833.06,
      nifDestinatario: 'DE812345678', nombreDestinatario: 'Hoffmann Fleet GmbH',
      estadoVeriFactu: 'aceptada',
      csvAeat: 'CSV-A43-2026-W5T2V9Y', fechaEnvioAeat: new Date('2026-03-15T11:30:00Z'),
      huella: 'c5d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
      huellaAnterior: 'b4c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    },

    // EV Nordic Fleet (C03) — NIF DK29372551
    {
      id: 'INV-2026-0044', companyId: 'C03',
      description: 'Tesla Model Y LR AWD × 4',
      amount: 124000, currency: 'EUR', status: 'paid',
      issuedAt: new Date('2026-03-10'), dueAt: new Date('2026-04-09'), paidAt: new Date('2026-04-05'),
      serie: 'A', numero: 44, tipoFactura: 'F1',
      baseImponible: 102479.34, tipoIVA: 21, cuotaIVA: 21520.66,
      nifDestinatario: 'DK29372551', nombreDestinatario: 'EV Nordic Fleet ApS',
      estadoVeriFactu: 'aceptada',
      csvAeat: 'CSV-A44-2026-H8J4K6M', fechaEnvioAeat: new Date('2026-03-10T08:45:00Z'),
      huella: 'd6e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
      huellaAnterior: 'c5d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    },
    {
      id: 'INV-2026-0045', companyId: 'C03',
      description: 'Battery health assessment × 4',
      amount: 2400, currency: 'EUR', status: 'issued',
      issuedAt: new Date('2026-04-12'), dueAt: new Date('2026-05-12'), paidAt: null,
      serie: 'A', numero: 45, tipoFactura: 'F1',
      baseImponible: 1983.47, tipoIVA: 21, cuotaIVA: 416.53,
      nifDestinatario: 'DK29372551', nombreDestinatario: 'EV Nordic Fleet ApS',
      estadoVeriFactu: 'pendiente',
      huella: 'e7f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
      huellaAnterior: 'd6e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    },

    // MotorPrime BV (C08) — NIF NL855234107B01
    {
      id: 'INV-2026-0046', companyId: 'C08',
      description: 'Mercedes E 300 × 2',
      amount: 77800, currency: 'EUR', status: 'disputed',
      issuedAt: new Date('2026-03-28'), dueAt: new Date('2026-04-27'), paidAt: null,
      serie: 'A', numero: 46, tipoFactura: 'F1',
      baseImponible: 64297.52, tipoIVA: 21, cuotaIVA: 13502.48,
      nifDestinatario: 'NL855234107B01', nombreDestinatario: 'MotorPrime BV',
      estadoVeriFactu: 'aceptada',
      csvAeat: 'CSV-A46-2026-P2R7S4U', fechaEnvioAeat: new Date('2026-03-28T14:20:00Z'),
      huella: 'f8a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
      huellaAnterior: 'e7f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    },

    // Nordic Premium Cars AB (C09) — NIF SE556789012301 — facturas en SEK (tipo 0% = intracomunitaria)
    {
      id: 'INV-2026-0047', companyId: 'C09',
      description: 'Volvo XC60 T8 × 3',
      amount: 54200, currency: 'SEK', status: 'paid',
      issuedAt: new Date('2026-03-20'), dueAt: new Date('2026-04-19'), paidAt: new Date('2026-04-10'),
      serie: 'B', numero: 1, tipoFactura: 'F1',
      baseImponible: 54200, tipoIVA: 0, cuotaIVA: 0,
      nifDestinatario: 'SE556789012301', nombreDestinatario: 'Nordic Premium Cars AB',
      estadoVeriFactu: 'aceptada',
      csvAeat: 'CSV-B01-2026-Z1A9C3E', fechaEnvioAeat: new Date('2026-03-20T12:00:00Z'),
      huella: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      huellaAnterior: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    {
      id: 'INV-2026-0048', companyId: 'C09',
      description: 'Volvo XC90 B5 × 3 (deposit)',
      amount: 18000, currency: 'SEK', status: 'issued',
      issuedAt: new Date('2026-04-09'), dueAt: new Date('2026-05-09'), paidAt: null,
      serie: 'B', numero: 2, tipoFactura: 'F1',
      baseImponible: 18000, tipoIVA: 0, cuotaIVA: 0,
      nifDestinatario: 'SE556789012301', nombreDestinatario: 'Nordic Premium Cars AB',
      estadoVeriFactu: 'enviada',
      fechaEnvioAeat: new Date('2026-04-09T13:45:00Z'),
      huella: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      huellaAnterior: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    },

    // Central Auto Trading (C07) — NIF BE0531697169
    {
      id: 'INV-2026-0049', companyId: 'C07',
      description: 'VW T6.1 Transporter × 8',
      amount: 216000, currency: 'EUR', status: 'paid',
      issuedAt: new Date('2026-03-26'), dueAt: new Date('2026-04-25'), paidAt: new Date('2026-04-20'),
      serie: 'A', numero: 49, tipoFactura: 'F1',
      baseImponible: 178512.40, tipoIVA: 21, cuotaIVA: 37487.60,
      nifDestinatario: 'BE0531697169', nombreDestinatario: 'Central Auto Trading SA',
      estadoVeriFactu: 'aceptada',
      csvAeat: 'CSV-A49-2026-G4H6I8J', fechaEnvioAeat: new Date('2026-03-26T09:30:00Z'),
      huella: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      huellaAnterior: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    },

    // Laurent Automobiles (C02) — NIF FR40303265045
    {
      id: 'INV-2026-0050', companyId: 'C02',
      description: 'Audi A6 Avant 45 TDI × 2',
      amount: 94000, currency: 'EUR', status: 'issued',
      issuedAt: new Date('2026-04-08'), dueAt: new Date('2026-05-08'), paidAt: null,
      serie: 'A', numero: 50, tipoFactura: 'F1',
      baseImponible: 77685.95, tipoIVA: 21, cuotaIVA: 16314.05,
      nifDestinatario: 'FR40303265045', nombreDestinatario: 'Laurent Automobiles SARL',
      estadoVeriFactu: 'rechazada',
      fechaEnvioAeat: new Date('2026-04-08T10:00:00Z'),
      respuestaAeat: { codigoError: '1105', descripcionError: 'NIF del destinatario no identificado en el censo de la AEAT' },
      huella: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      huellaAnterior: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    },
  ];

  for (const inv of invoiceSeed) {
    await prisma.invoice.upsert({
      where: { id: inv.id },
      update: {
        estadoVeriFactu: inv.estadoVeriFactu,
        csvAeat: inv.csvAeat ?? null,
        fechaEnvioAeat: inv.fechaEnvioAeat ?? null,
        respuestaAeat: (inv.respuestaAeat ?? null) as any,
        huella: inv.huella ?? null,
        huellaAnterior: inv.huellaAnterior ?? null,
        baseImponible: inv.baseImponible,
        tipoIVA: inv.tipoIVA,
        cuotaIVA: inv.cuotaIVA,
        nifDestinatario: inv.nifDestinatario ?? null,
        nombreDestinatario: inv.nombreDestinatario ?? null,
        nifEmisor: EMISOR_NIF,
        nombreEmisor: EMISOR_NOMBRE,
      },
      create: {
        ...inv,
        nifEmisor: EMISOR_NIF,
        nombreEmisor: EMISOR_NOMBRE,
        respuestaAeat: (inv.respuestaAeat ?? undefined) as any,
        updatedAt: new Date(),
      },
    });
  }

  console.log(`  ✓  ${invoiceSeed.length} invoices (VeriFactu)`);

  // ─── Portal users ─────────────────────────────────────────────────────────
  // Demo portal account: demo@portal.tradeon.es / PortalDemo1
  // Hoffmann Fleet portal: fleet@hoffmannfleet.de / Hoffmann2026
  // EV Nordic portal:     lnielsen@evnordic.dk   / Nordic2026
  // Change all passwords before exposing to any network.

  const portalPwHash = await bcrypt.hash('PortalDemo1', BCRYPT_ROUNDS);
  const hoffmannPwHash = await bcrypt.hash('Hoffmann2026', BCRYPT_ROUNDS);
  const nordicPwHash = await bcrypt.hash('Nordic2026', BCRYPT_ROUNDS);

  const portalUserSeed = [
    {
      email: 'demo@portal.tradeon.es',
      name: 'Demo Customer',
      passwordHash: portalPwHash,
      companyId: 'C01',
      contactId: 'P01',
    },
    {
      email: 'fleet@hoffmannfleet.de',
      name: 'Markus Hoffmann',
      passwordHash: hoffmannPwHash,
      companyId: 'C01',
      contactId: null as string | null,  // P01 claimed by demo user — use separate contact
    },
    {
      email: 'lnielsen@evnordic.dk',
      name: 'Lars Nielsen',
      passwordHash: nordicPwHash,
      companyId: 'C03',
      contactId: 'P04',
    },
  ];

  for (const pu of portalUserSeed) {
    await prisma.portalUser.upsert({
      where: { email: pu.email },
      update: {},
      create: {
        email: pu.email,
        name: pu.name,
        passwordHash: pu.passwordHash,
        companyId: pu.companyId,
        contactId: pu.contactId,
        updatedAt: new Date(),
      },
    });
  }

  console.log(`  ✓  ${portalUserSeed.length} portal users`);

  // ─── Vehicles ────────────────────────────────────────────────────────────────

  const vehicleSeed: Array<Parameters<typeof prisma.vehicle.upsert>[0]['create']> = [
    {
      id: 'V01', stockNumber: 'STO-2024-001', vin: 'WBA11CF080GX00001',
      make: 'BMW', model: '5 Series', variant: '520d xDrive',
      year: 2023, mileage: 18400, fuelType: FuelType.diesel,
      transmission: VehicleTransmission.automatic,
      color: 'Alpine White', price: 42500, currency: 'EUR',
      status: VehicleStatus.available, location: 'Madrid Depot',
      description: 'Full service history. Parking sensors, heated seats, LED headlights.',
    },
    {
      id: 'V02', stockNumber: 'STO-2024-002', vin: 'WVWZZZ3CZPE000002',
      make: 'Volkswagen', model: 'Passat', variant: '2.0 TDI Business',
      year: 2022, mileage: 34100, fuelType: FuelType.diesel,
      transmission: VehicleTransmission.automatic,
      color: 'Deep Black Pearl', price: 28900, currency: 'EUR',
      status: VehicleStatus.available, location: 'Barcelona Hub',
      description: 'One owner. Navigation, adaptive cruise control.',
    },
    {
      id: 'V03', stockNumber: 'STO-2024-003', vin: 'YV1XZ751BE000003',
      make: 'Volvo', model: 'XC60', variant: 'B4 AWD Inscription',
      year: 2023, mileage: 9200, fuelType: FuelType.hybrid,
      transmission: VehicleTransmission.automatic,
      color: 'Crystal White', price: 51800, currency: 'EUR',
      status: VehicleStatus.reserved, location: 'Madrid Depot',
      description: 'Mild hybrid. Panoramic roof, Bowers & Wilkins audio, 7-year warranty.',
    },
    {
      id: 'V04', stockNumber: 'STO-2024-004',
      make: 'Mercedes-Benz', model: 'E-Class', variant: 'E220d AMG Line',
      year: 2021, mileage: 62000, fuelType: FuelType.diesel,
      transmission: VehicleTransmission.automatic,
      color: 'Obsidian Black', price: 34200, currency: 'EUR',
      status: VehicleStatus.available, location: 'Valencia Store',
      description: 'AMG body kit, burmester sound system, 360 camera.',
    },
    {
      id: 'V05', stockNumber: 'STO-2024-005', vin: 'WAUZZZ4G7KN000005',
      make: 'Audi', model: 'A4', variant: '35 TDI S Line',
      year: 2022, mileage: 41300, fuelType: FuelType.diesel,
      transmission: VehicleTransmission.automatic,
      color: 'Chronos Grey', price: 31500, currency: 'EUR',
      status: VehicleStatus.sold, location: 'Barcelona Hub',
      description: 'S line package, virtual cockpit, Matrix LED.',
    },
    {
      id: 'V06', stockNumber: 'STO-2024-006', vin: 'TMBJP7NS5N3000006',
      make: 'Skoda', model: 'Octavia', variant: '2.0 TDI Style',
      year: 2023, mileage: 5500, fuelType: FuelType.diesel,
      transmission: VehicleTransmission.manual,
      color: 'Race Blue', price: 26800, currency: 'EUR',
      status: VehicleStatus.available, location: 'Madrid Depot',
      description: 'Nearly new, full manufacturer warranty remaining.',
    },
    {
      id: 'V07', stockNumber: 'STO-2024-007',
      make: 'Tesla', model: 'Model 3', variant: 'Long Range AWD',
      year: 2022, mileage: 28700, fuelType: FuelType.electric,
      transmission: VehicleTransmission.automatic,
      color: 'Midnight Silver', price: 44900, currency: 'EUR',
      status: VehicleStatus.available, location: 'Barcelona Hub',
      description: '579km WLTP range. Enhanced autopilot, glass roof.',
    },
    {
      id: 'V08', stockNumber: 'STO-2024-008',
      make: 'Toyota', model: 'RAV4', variant: 'Plug-in Hybrid',
      year: 2023, mileage: 11200, fuelType: FuelType.phev,
      transmission: VehicleTransmission.automatic,
      color: 'Pearl White', price: 47200, currency: 'EUR',
      status: VehicleStatus.draft, location: 'Madrid Depot',
      description: 'Under inspection. 75km electric range. All-wheel drive.',
    },
    {
      id: 'V09', stockNumber: 'STO-2023-091',
      make: 'Ford', model: 'Focus', variant: '1.0 EcoBoost ST-Line',
      year: 2021, mileage: 55000, fuelType: FuelType.petrol,
      transmission: VehicleTransmission.manual,
      color: 'Frozen White', price: 18400, currency: 'EUR',
      status: VehicleStatus.archived, location: 'Valencia Store',
      description: 'Archived — sold externally before listing.',
    },
    {
      id: 'V10', stockNumber: 'STO-2024-010', vin: 'WVGZZZ5NZLW000010',
      make: 'Volkswagen', model: 'Tiguan', variant: '2.0 TDI 4Motion R-Line',
      year: 2023, mileage: 14800, fuelType: FuelType.diesel,
      transmission: VehicleTransmission.automatic,
      color: 'Lapiz Blue', price: 39900, currency: 'EUR',
      status: VehicleStatus.available, location: 'Madrid Depot',
      description: 'R-Line exterior, digital cockpit pro, travel assist.',
    },
  ];

  for (const v of vehicleSeed) {
    await prisma.vehicle.upsert({
      where: { stockNumber: v.stockNumber },
      update: {},
      create: { ...v, updatedAt: new Date() },
    });
  }

  console.log(`  ✓  ${vehicleSeed.length} vehicles`);
  console.log('\n✅  Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
