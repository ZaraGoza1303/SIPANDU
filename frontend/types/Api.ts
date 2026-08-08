// Types mirroring the response shapes documented in API-Documentation.md

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalExaminationsThisMonth: number;
  stuntingCount: number;
  normalCount: number;
  ageGroupDistribution: AgeGroupDistributionItem[];
}

export interface AgeGroupDistributionItem {
  range: string;
  count: number;
}

export interface TrendStuntingItem {
  month: string; // "Mon YYYY", e.g. "Jun 2026"
  total: number;
  stunting: number;
  percentage: number;
}

export interface Patient {
  id: string;
  nik: string;
  name: string;
  birth_date: string;
  gender: "Laki-Laki" | "Perempuan";
  mother_name: string;
  father_name: string | null;
  address: string;
  phone_parent: string;
  picture: string | null;
  posyandu_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total_items: number;
  current_page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedPatients {
  items: Patient[];
  next_cursor: string | null;
  meta: PaginationMeta;
}