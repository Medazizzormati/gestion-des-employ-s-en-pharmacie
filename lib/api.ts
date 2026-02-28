// API client for HR Agent backend with TanStack Query support
// Configured for localhost during development, adjust API_URL for production

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gestion-des-employ-s-en-pharmacie.onrender.com/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private buildURL(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    const url = this.buildURL(endpoint, params);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }
}

// Create singleton instance
const apiClient = new APIClient();

// API Methods
export const api = {
  // Employees
  getEmployees: (filters?: any) =>
    apiClient.get('/employees/', { params: filters }),
  getEmployee: (id: number) =>
    apiClient.get(`/employees/${id}/`),
  getEmployeeSchedule: (id: number) =>
    apiClient.get(`/employees/${id}/schedule/`),
  getEmployeeCompliance: (id: number) =>
    apiClient.get(`/employees/${id}/compliance_status/`),
  createEmployee: (data: any) =>
    apiClient.post('/employees/', data),
  updateEmployee: (id: number, data: any) =>
    apiClient.patch(`/employees/${id}/`, data),

  // Shifts
  getShifts: (filters?: any) =>
    apiClient.get('/shifts/', { params: filters }),
  getShiftsThisWeek: () =>
    apiClient.get('/shifts/this_week/'),
  getShift: (id: number) =>
    apiClient.get(`/shifts/${id}/`),
  createShift: (data: any) =>
    apiClient.post('/shifts/', data),
  createShiftsBulk: (shifts: any[]) =>
    apiClient.post('/shifts/bulk_create/', { shifts }),
  updateShift: (id: number, data: any) =>
    apiClient.patch(`/shifts/${id}/`, data),
  deleteShift: (id: number) =>
    apiClient.delete(`/shifts/${id}/`),

  // Absences
  getAbsences: (filters?: any) =>
    apiClient.get('/absences/', { params: filters }),
  getPendingAbsences: () =>
    apiClient.get('/absences/pending/'),
  getAbsence: (id: number) =>
    apiClient.get(`/absences/${id}/`),
  createAbsence: (data: any) =>
    apiClient.post('/absences/', data),
  updateAbsence: (id: number, data: any) =>
    apiClient.patch(`/absences/${id}/`, data),
  approveAbsence: (id: number) =>
    apiClient.post(`/absences/${id}/approve/`, {}),
  refuseAbsence: (id: number, reason: string) =>
    apiClient.post(`/absences/${id}/refuse/`, { reason }),

  // Compliance
  getComplianceRules: () =>
    apiClient.get('/compliance-rules/'),
  getComplianceViolations: (filters?: any) =>
    apiClient.get('/compliance-violations/', { params: filters }),
  checkCompliance: (employeeId: number, weekStart?: string) =>
    apiClient.post('/compliance/check/', { employee_id: employeeId, week_start: weekStart }),
  resolveViolation: (id: number) =>
    apiClient.post(`/compliance-violations/${id}/resolve/`, {}),

  // Chat
  sendMessage: (message: string) =>
    apiClient.post('/chat/', { message }),
  getChatHistory: () =>
    apiClient.get('/chat/history/'),

  // Forecast
  getForecast: (days: number = 7) =>
    apiClient.get('/forecast/', { params: { days } }),

  // Demo
  seedDemoData: () =>
    apiClient.post('/demo/seed/', {}),

  // Auth
  setToken: (token: string | null) => apiClient.setToken(token),
  getToken: () => apiClient.getToken(),
};

export type Employee = {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  role: string;
  role_display: string;
  contract_type: string;
  contract_type_display: string;
  contract_hours: number;
  is_qualified_pharmacist: boolean;
  license_number: string;
  phone: string;
  hire_date: string;
  remaining_vacation_days: number;
  created_at: string;
};

export type WorkShift = {
  id: number;
  employee: number;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  status: string;
  status_display: string;
  is_night_shift: boolean;
  generated_by_ai: boolean;
  duration_hours: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type AbsenceRequest = {
  id: number;
  employee: number;
  employee_name: string;
  type: string;
  type_display: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  status_display: string;
  manager_comment: string;
  approved_by: number | null;
  approved_by_name: string | null;
  days_count: number;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: number;
  user: number;
  user_name: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type ComplianceViolation = {
  id: number;
  rule: number;
  rule_code: string;
  rule_name: string;
  employee: number;
  employee_name: string;
  shift: number | null;
  severity: 'info' | 'warning' | 'critical';
  severity_display: string;
  description: string;
  detected_at: string;
  resolved: boolean;
  resolved_at: string | null;
};
