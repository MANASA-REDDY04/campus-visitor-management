import axios from 'axios';
import {
  ApiResponse,
  DashboardStats,
  RegisterResponse,
  RegistrationFormData,
  Visit,
} from '@/types/visitor';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Auto-retry transient network disconnects (e.g. during dev server reloads)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || (config as Record<string, unknown>).__isRetryRequest) {
      return Promise.reject(error);
    }
    // If server was temporarily unavailable or disconnected
    if (error.code === 'ERR_NETWORK' || !error.response) {
      (config as Record<string, unknown>).__isRetryRequest = true;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return api(config);
    }
    return Promise.reject(error);
  }
);

// ─── Visitor APIs ──────────────────────────────────────────────────────────

export async function registerVisit(
  data: RegistrationFormData
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/api/visitors/register', data);
  return res.data;
}

export async function getVisitByPassId(
  passId: string
): Promise<ApiResponse<Visit>> {
  const res = await api.get<ApiResponse<Visit>>(
    `/api/visitors/visits/pass/${passId}`
  );
  return res.data;
}

export async function getVisitById(
  visitId: string
): Promise<ApiResponse<Visit>> {
  const res = await api.get<ApiResponse<Visit>>(
    `/api/visitors/visits/${visitId}`
  );
  return res.data;
}

// ─── Admin APIs ────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const res = await api.get<ApiResponse<DashboardStats>>('/api/admin/stats');
  return res.data;
}

export async function getAllVisits(params?: {
  status?: string;
  date?: string;
  department?: string;
}): Promise<ApiResponse<Visit[]>> {
  const res = await api.get<ApiResponse<Visit[]>>('/api/admin/visits', {
    params,
  });
  return res.data;
}

export async function approveVisit(visitId: string): Promise<ApiResponse<Visit>> {
  const res = await api.patch<ApiResponse<Visit>>(
    `/api/admin/visits/${visitId}/approve`
  );
  return res.data;
}

export async function rejectVisit(visitId: string): Promise<ApiResponse<Visit>> {
  const res = await api.patch<ApiResponse<Visit>>(
    `/api/admin/visits/${visitId}/reject`
  );
  return res.data;
}

export async function getVisitHistory(params?: {
  date?: string;
  department?: string;
  status?: string;
}): Promise<ApiResponse<Visit[]>> {
  const res = await api.get<ApiResponse<Visit[]>>('/api/admin/history', {
    params,
  });
  return res.data;
}

// ─── Security APIs ─────────────────────────────────────────────────────────

export async function getTodaysVisitors(): Promise<ApiResponse<Visit[]>> {
  const res = await api.get<ApiResponse<Visit[]>>('/api/security/today');
  return res.data;
}

export async function verifyPass(passId: string): Promise<ApiResponse<Visit>> {
  const res = await api.get<ApiResponse<Visit>>(
    `/api/security/verify/${passId}`
  );
  return res.data;
}

export async function checkIn(visitId: string): Promise<ApiResponse<Visit>> {
  const res = await api.patch<ApiResponse<Visit>>(
    `/api/security/${visitId}/check-in`
  );
  return res.data;
}

export async function checkOut(visitId: string): Promise<ApiResponse<Visit>> {
  const res = await api.patch<ApiResponse<Visit>>(
    `/api/security/${visitId}/check-out`
  );
  return res.data;
}

// ─── Auth APIs ─────────────────────────────────────────────────────────────

export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; message: string; user?: import('@/types/auth').AuthUser; token?: string }> {
  const res = await api.post('/api/auth/login', { username, password });
  return res.data;
}
