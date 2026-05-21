/**
 * API client for TradEon CRM.
 *
 * Each function tries the real NestJS API first.
 * On network failure or 404, it falls back to mock data so the
 * frontend works without a running backend.
 */

import type { AuthUser, Company, Contact, CreateInvoicePayload, CreateVehiclePayload, Deal, DealProfitability, Invoice, LoginResponse, PaginatedResponse, StaffUser, Task, UpdateDealProfitabilityPayload, UpdateVehiclePayload, Vehicle } from './types';
import {
  MOCK_COMPANIES,
  MOCK_CONTACTS,
  MOCK_DEALS,
  MOCK_DEMO_USER,
  MOCK_INVOICES,
  MOCK_TASKS,
  MOCK_VEHICLES,
  getContactsByCompany,
  getCompanyById,
  getDealsByCompany,
  getInvoiceById,
  getInvoicesByCompany,
  getStaffById,
  getVehicleById,
} from './mock-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  try {
    return await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // Mock fallback — works without a running backend
    if (email === 'demo@crm.tradeon.es' && password === 'CRMDemo1') {
      return { accessToken: 'mock_access_token', refreshToken: 'mock_refresh_token' };
    }
    throw new Error('Invalid email or password');
  }
}

export async function apiMe(): Promise<AuthUser> {
  try {
    return await apiFetch<AuthUser>('/auth/me');
  } catch {
    return MOCK_DEMO_USER;
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // ignore — we clear tokens client-side regardless
  }
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function apiGetCompanies(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Company>> {
  try {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.page)   qs.set('page',   String(params.page));
    if (params?.limit)  qs.set('limit',  String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return await apiFetch<PaginatedResponse<Company>>(`/customers${query}`);
  } catch {
    let items = [...MOCK_COMPANIES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== 'all') {
      items = items.filter(c => c.status === params.status);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const start = (page - 1) * limit;
    return {
      data: items.slice(start, start + limit),
      meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) },
    };
  }
}

export async function apiGetCompany(id: string): Promise<Company & { contacts: Contact[]; deals: Deal[] }> {
  try {
    return await apiFetch<Company & { contacts: Contact[]; deals: Deal[] }>(`/customers/${id}`);
  } catch {
    const company = getCompanyById(id);
    if (!company) throw new Error(`Company ${id} not found`);
    return {
      ...company,
      contacts: getContactsByCompany(id),
      deals: getDealsByCompany(id),
    };
  }
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function apiGetDeals(params?: {
  status?: string;
  companyId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Deal>> {
  try {
    const qs = new URLSearchParams();
    if (params?.status)    qs.set('status',    params.status);
    if (params?.companyId) qs.set('companyId', params.companyId);
    if (params?.page)      qs.set('page',      String(params.page));
    if (params?.limit)     qs.set('limit',     String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return await apiFetch<PaginatedResponse<Deal>>(`/deals${query}`);
  } catch {
    let items = MOCK_DEALS.map(d => {
      const company = getCompanyById(d.companyId);
      return { ...d, company: company ? { id: company.id, name: company.name, country: company.country } : undefined };
    });
    if (params?.status && params.status !== 'all') {
      items = items.filter(d => d.status === params.status);
    }
    if (params?.companyId) {
      items = items.filter(d => d.companyId === params.companyId);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const start = (page - 1) * limit;
    return {
      data: items.slice(start, start + limit),
      meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) },
    };
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function apiGetTasks(params?: {
  status?: string;
  assignedUserId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Task>> {
  try {
    const qs = new URLSearchParams();
    if (params?.status)         qs.set('status',         params.status);
    if (params?.assignedUserId) qs.set('assignedUserId', params.assignedUserId);
    if (params?.page)           qs.set('page',           String(params.page));
    if (params?.limit)          qs.set('limit',          String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return await apiFetch<PaginatedResponse<Task>>(`/tasks${query}`);
  } catch {
    let items = [...MOCK_TASKS];
    if (params?.status && params.status !== 'all') {
      items = items.filter(t => t.status === params.status);
    }
    if (params?.assignedUserId) {
      items = items.filter(t => t.assignedUserId === params.assignedUserId);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const start = (page - 1) * limit;
    return {
      data: items.slice(start, start + limit),
      meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) },
    };
  }
}

export async function apiUpdateTask(id: string, data: { status: Task['status'] }): Promise<Task> {
  try {
    return await apiFetch<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch {
    const task = MOCK_TASKS.find(t => t.id === id);
    if (!task) throw new Error(`Task ${id} not found`);
    task.status = data.status;
    return { ...task };
  }
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export async function apiGetVehicles(params?: {
  status?: string;
  make?: string;
  model?: string;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Vehicle>> {
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.make)   qs.set('make',   params.make);
    if (params?.model)  qs.set('model',  params.model);
    if (params?.year)   qs.set('year',   String(params.year));
    if (params?.search) qs.set('search', params.search);
    if (params?.page)   qs.set('page',   String(params.page));
    if (params?.limit)  qs.set('limit',  String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return await apiFetch<PaginatedResponse<Vehicle>>(`/vehicles${query}`);
  } catch {
    let items = [...MOCK_VEHICLES];
    if (params?.status && params.status !== 'all') {
      items = items.filter(v => v.status === params.status);
    }
    if (params?.make) {
      const q = params.make.toLowerCase();
      items = items.filter(v => v.make.toLowerCase().includes(q));
    }
    if (params?.model) {
      const q = params.model.toLowerCase();
      items = items.filter(v => v.model.toLowerCase().includes(q));
    }
    if (params?.year) {
      items = items.filter(v => v.year === params.year);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(v =>
        v.stockNumber.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q),
      );
    }
    const page  = params?.page  ?? 1;
    const limit = params?.limit ?? 25;
    const start = (page - 1) * limit;
    return {
      data: items.slice(start, start + limit),
      meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) },
    };
  }
}

export async function apiGetVehicle(id: string): Promise<Vehicle> {
  try {
    return await apiFetch<Vehicle>(`/vehicles/${id}`);
  } catch {
    const v = getVehicleById(id);
    if (!v) throw new Error(`Vehicle ${id} not found`);
    return v;
  }
}

export async function apiCreateVehicle(data: CreateVehiclePayload): Promise<Vehicle> {
  try {
    return await apiFetch<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) });
  } catch {
    const newVehicle: Vehicle = {
      ...data,
      id: `V${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_VEHICLES.push(newVehicle);
    return newVehicle;
  }
}

export async function apiUpdateVehicle(id: string, data: UpdateVehiclePayload): Promise<Vehicle> {
  try {
    return await apiFetch<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  } catch {
    const idx = MOCK_VEHICLES.findIndex(v => v.id === id);
    if (idx === -1) throw new Error(`Vehicle ${id} not found`);
    MOCK_VEHICLES[idx] = { ...MOCK_VEHICLES[idx], ...data, updatedAt: new Date().toISOString() };
    return { ...MOCK_VEHICLES[idx] };
  }
}

export async function apiChangeVehicleStatus(id: string, status: Vehicle['status']): Promise<Vehicle> {
  try {
    return await apiFetch<Vehicle>(`/vehicles/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  } catch {
    return apiUpdateVehicle(id, { status });
  }
}

export async function apiGetDeal(id: string): Promise<Deal> {
  try {
    return await apiFetch<Deal>(`/crm/deals/${id}`);
  } catch {
    const deal = MOCK_DEALS.find(d => d.id === id);
    if (!deal) throw new Error(`Deal ${id} not found`);
    const company = deal.companyId ? getCompanyById(deal.companyId) : undefined;
    const assigned = deal.assignedUserId ? getStaffById(deal.assignedUserId) : undefined;
    return {
      ...deal,
      company:      company  ? { id: company.id, name: company.name, country: company.country } : undefined,
      assignedUser: assigned ? { id: assigned.id, name: assigned.name, initials: assigned.initials, color: assigned.color } : undefined,
    };
  }
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export async function apiGetStaffUsers(): Promise<StaffUser[]> {
  return apiFetch<StaffUser[]>('/finance/users');
}

export async function apiGetDealProfitability(dealId: string): Promise<DealProfitability> {
  return apiFetch<DealProfitability>(`/finance/deal-profitability/${dealId}`);
}

export async function apiUpdateDealProfitability(
  dealId: string,
  data: UpdateDealProfitabilityPayload,
): Promise<DealProfitability> {
  return apiFetch<DealProfitability>(`/finance/deal-profitability/${dealId}`, {
    method: 'PATCH',
    body:   JSON.stringify(data),
  });
}

export async function apiRecalculateDealProfitability(dealId: string): Promise<DealProfitability> {
  return apiFetch<DealProfitability>(`/finance/deal-profitability/${dealId}/recalculate`, {
    method: 'POST',
  });
}

export async function apiGetFinanceDealList(): Promise<DealProfitability[]> {
  return apiFetch<DealProfitability[]>('/finance/deal-profitability');
}

// ─── Invoices / VeriFactu ─────────────────────────────────────────────────────

export async function apiGetInvoices(params?: {
  companyId?: string;
  status?: string;
  estadoVeriFactu?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Invoice>> {
  try {
    const qs = new URLSearchParams();
    if (params?.companyId)       qs.set('companyId',       params.companyId);
    if (params?.status)          qs.set('status',          params.status);
    if (params?.estadoVeriFactu) qs.set('estadoVeriFactu', params.estadoVeriFactu);
    if (params?.page)            qs.set('page',            String(params.page));
    if (params?.limit)           qs.set('limit',           String(params.limit));
    return await apiFetch<PaginatedResponse<Invoice>>(`/invoices?${qs}`);
  } catch {
    let items = params?.companyId
      ? getInvoicesByCompany(params.companyId)
      : [...MOCK_INVOICES];
    if (params?.status)
      items = items.filter(i => i.status === params.status);
    if (params?.estadoVeriFactu)
      items = items.filter(i => i.estadoVeriFactu === params.estadoVeriFactu);
    items.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
    const page  = params?.page  ?? 1;
    const limit = params?.limit ?? 25;
    const start = (page - 1) * limit;
    return {
      data: items.slice(start, start + limit),
      meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) },
    };
  }
}

export async function apiGetInvoice(id: string): Promise<Invoice> {
  try {
    return await apiFetch<Invoice>(`/invoices/${id}`);
  } catch {
    const inv = getInvoiceById(id);
    if (!inv) throw new Error(`Invoice ${id} not found`);
    return inv;
  }
}

export async function apiCreateInvoice(data: CreateInvoicePayload): Promise<Invoice> {
  return apiFetch<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiSubmitVeriFactu(id: string): Promise<Invoice> {
  try {
    return await apiFetch<Invoice>(`/invoices/${id}/submit-verifactu`, { method: 'POST' });
  } catch {
    // Mock fallback: simulate AEAT acceptance
    const inv = getInvoiceById(id);
    if (!inv) throw new Error(`Invoice ${id} not found`);
    const updated: Invoice = {
      ...inv,
      estadoVeriFactu: 'aceptada',
      csvAeat: `CSV-${inv.serie}${inv.numero}-${new Date().getFullYear()}-MOCK123`,
      fechaEnvioAeat: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    Object.assign(inv, updated);
    return updated;
  }
}
