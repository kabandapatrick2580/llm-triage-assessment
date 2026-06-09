export const CATEGORIES = [
  "Billing",
  "Technical Support",
  "Admissions",
  "Account Access",
  "General Inquiry",
  "Complaint",
] as const;

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];

export interface KeyFields {
  transaction_code: string | null;
  email: string | null;
  phone: string | null;
  student_id: string | null;
}

export interface Ticket {
  id: number;
  original_text: string;
  category: Category;
  priority: Priority;
  customer_name?: string | null;
  issue_summary: string;
  suggested_reply: string;
  key_fields: KeyFields;
  created_at: string;
}

export interface TicketPage {
  success: true;
  data: Ticket[];
  page: number;
  per_page: number;
  total: number;
}
