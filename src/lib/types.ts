export type StaffRole = 'director' | 'manager' | 'admin';

export interface Profile {
  id: string;
  tenant_id: string;
  email: string | null;
  full_name: string | null;
  role: StaffRole;
}

export interface Lead {
  id: string;
  tenant_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  need_summary: string | null;
  budget_range: string | null;
  recommended: string | null;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface TenantPublic {
  slug: string;
  company_name: string;
  chat_greeting: string;
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  director: 'Директор',
  manager: 'Менеджер',
  admin: 'Администратор',
};
