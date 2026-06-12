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

/** Lifecycle of a raw student message in the Intake Queue (pre-triage). */
export type MessageStatus = "pending" | "triaging" | "triaged" | "failed";

/** An unstructured inbound message sitting in the queue before it's triaged. */
export interface RawMessage {
  id: string;
  text: string;
  from?: string | null;
  receivedAt: string;
  status: MessageStatus;
  /** Id of the Ticket created once triaged, for deep-linking into the inbox. */
  ticketId?: number | null;
  error?: string | null;
}
