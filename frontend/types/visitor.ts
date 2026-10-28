export type VisitorType = 'PARENT' | 'GUEST' | 'VENDOR' | 'ALUMNI' | 'OTHER';
export type VisitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface Visitor {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  visitor_type: VisitorType;
  created_at: string;
}

export interface Visit {
  id: string;
  visitor_id: string;
  person_to_visit: string;
  department: string;
  purpose: string;
  visit_date: string;
  arrival_time: string;
  departure_time?: string;
  status: VisitStatus;
  pass_id: string;
  check_in_time?: string;
  check_out_time?: string;
  created_at: string;
  updated_at: string;
  visitor: Visitor;
}

export interface DashboardStats {
  total_visitors: number;
  pending_requests: number;
  approved_visits: number;
  currently_inside: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  visit_id: string;
  pass_id: string;
  status: VisitStatus;
}

export interface RegistrationFormData {
  full_name: string;
  phone: string;
  email: string;
  visitor_type: VisitorType;
  person_to_visit: string;
  department: string;
  purpose: string;
  visit_date: string;
  arrival_time: string;
  departure_time: string;
}
