import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api, Employee, WorkShift, AbsenceRequest } from '@/lib/api';
import { mockEmployees, mockShifts, mockAbsences, mockCompliance } from '@/lib/mock-data';

const QUERY_KEYS = {
  employees: ['employees'],
  shifts: ['shifts'],
  shiftsThisWeek: ['shifts', 'thisWeek'],
  absences: ['absences'],
  pendingAbsences: ['absences', 'pending'],
  compliance: ['compliance'],
  chat: ['chat'],
  forecast: ['forecast'],
};

const USE_MOCK_DATA = false; // Mock data active — no auth token needed


// Hook for fetching all employees
export function useEmployees(filters?: any) {
  return useQuery({
    queryKey: [QUERY_KEYS.employees, filters],
    queryFn: async () => {
      if (USE_MOCK_DATA) return { results: mockEmployees };
      return api.getEmployees(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }) as UseQueryResult<{ results: Employee[] }>;
}

// Hook for fetching single employee
export function useEmployee(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.employees, id],
    queryFn: async () => {
      if (USE_MOCK_DATA) return mockEmployees.find(e => e.id === id);
      return api.getEmployee(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  }) as UseQueryResult<Employee>;
}

// Hook for creating/updating employee
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees });
    },
  }) as UseMutationResult<Employee, Error, any>;
}

// Hook for fetching shifts
export function useShifts(filters?: any) {
  return useQuery({
    queryKey: [QUERY_KEYS.shifts, filters],
    queryFn: async () => {
      if (USE_MOCK_DATA) return { results: mockShifts };
      return api.getShifts(filters);
    },
    staleTime: 3 * 60 * 1000,
  }) as UseQueryResult<{ results: WorkShift[] }>;
}

// Hook for fetching this week's shifts
export function useShiftsThisWeek() {
  return useQuery({
    queryKey: QUERY_KEYS.shiftsThisWeek,
    queryFn: async () => {
      if (USE_MOCK_DATA) return { shifts: mockShifts };
      return api.getShiftsThisWeek();
    },
    staleTime: 2 * 60 * 1000,
  }) as UseQueryResult<{ shifts: WorkShift[] }>;
}

// Hook for creating shifts
export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shifts });
    },
  }) as UseMutationResult<WorkShift, Error, any>;
}

// Hook for bulk creating shifts
export function useCreateShiftsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shifts: any[]) => api.createShiftsBulk(shifts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shifts });
    },
  }) as UseMutationResult<{ created: number; shifts: WorkShift[] }, Error, any[]>;
}

// Hook for fetching absences
export function useAbsences(filters?: any) {
  return useQuery({
    queryKey: [QUERY_KEYS.absences, filters],
    queryFn: async () => {
      if (USE_MOCK_DATA) return { results: mockAbsences };
      return api.getAbsences(filters);
    },
    staleTime: 3 * 60 * 1000,
  }) as UseQueryResult<{ results: AbsenceRequest[] }>;
}

// Hook for fetching pending absences
export function usePendingAbsences() {
  return useQuery({
    queryKey: QUERY_KEYS.pendingAbsences,
    queryFn: async () => {
      if (USE_MOCK_DATA) return { absences: mockAbsences.filter(a => a.status === 'pending') };
      return api.getPendingAbsences();
    },
    staleTime: 3 * 60 * 1000,
  }) as UseQueryResult<{ absences: AbsenceRequest[] }>;
}

// Hook for creating absence request
export function useCreateAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.createAbsence(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.absences });
    },
  }) as UseMutationResult<AbsenceRequest, Error, any>;
}

// Hook for approving absence
export function useApproveAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (absenceId: number) => api.approveAbsence(absenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.absences });
    },
  }) as UseMutationResult<AbsenceRequest, Error, number>;
}

// Hook for refusing absence
export function useRefuseAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ absenceId, reason }: { absenceId: number; reason: string }) =>
      api.refuseAbsence(absenceId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.absences });
    },
  }) as UseMutationResult<AbsenceRequest, Error, { absenceId: number; reason: string }>;
}

// Hook for compliance check
export function useComplianceCheck(employeeId?: number, weekStart?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.compliance, employeeId, weekStart],
    queryFn: async () => {
      if (USE_MOCK_DATA) return mockCompliance;
      if (!employeeId) throw new Error('Employee ID required');
      return api.checkCompliance(employeeId, weekStart);
    },
    enabled: !!employeeId,
    staleTime: 10 * 60 * 1000,
  }) as UseQueryResult<any>;
}

// Hook for chat
export function useChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => api.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat });
    },
  }) as UseMutationResult<any, Error, string>;
}

// Hook for forecast
export function useForecast(days: number = 7) {
  return useQuery({
    queryKey: [QUERY_KEYS.forecast, days],
    queryFn: async () => {
      if (USE_MOCK_DATA) return { forecast: [] };
      return api.getForecast(days);
    },
    staleTime: 30 * 60 * 1000,
  }) as UseQueryResult<any>;
}
