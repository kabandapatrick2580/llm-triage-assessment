import {
  Inbox,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

/** Buhangano brand identity. */
export const BRAND = {
  name: "Buhangano",
  tagline: "Applied intelligence for real-world operations.",
  product: "Self-Hosted LLM Assessment",
  address: "Kigali, Rwanda",
  url: "",
  year: 2026,
};

export interface AppCase {
  id: "triage" | "knowledge";
  /** UC label shown on cards. */
  badge: string;
  name: string;
  tagline: string;
  /** Longer description for the landing card. */
  blurb: string;
  icon: LucideIcon;
  /** Where the "Run" button leads. */
  runPath: string;
  /** Tailwind gradient classes for the card/hero accent. */
  gradient: string;
  tech: string[];
  /** Verbatim-in-spirit requirements from the assessment PDF. */
  required: string[];
  /** What we actually shipped (each maps to a requirement, and then some). */
  built: string[];
  /** The deliberately under-specified point + the call we made. */
  underspecified: { point: string; decision: string };
}

export const APPS: AppCase[] = [
  {
    id: "triage",
    badge: "Use Case 1",
    name: "Smart Intake Triage",
    tagline: "Structured generation",
    blurb:
      "Turn unstructured inbound messages into validated, structured tickets — classified, key fields extracted, and a reply drafted — in a filterable workspace.",
    icon: Inbox,
    runPath: "/triage",
    gradient: "from-brand-rust to-brand-amber",
    tech: ["Flask", "Pydantic", "Ollama · Qwen2.5", "React", "Tailwind"],
    required: [
      "Accept unstructured inbound text (support tickets / customer feedback).",
      "Classify each item — category + priority.",
      "Extract the key fields.",
      "Draft a suggested reply.",
      "Return validated, structured JSON.",
      "Show it in a simple, filterable dashboard.",
      "Handle malformed model output gracefully.",
    ],
    built: [
      "Enum-locked Pydantic schema — out-of-vocabulary category/priority is rejected, never persisted.",
      "Six-layer malformed-output defense: constrained JSON decoding → low temperature → defensive parse (502) → schema validation (422) → validated-only persistence → typed front-end error messages.",
      "Filterable, searchable, multi-column-sortable inbox plus a metrics dashboard.",
      "Intake Queue: paste raw student messages, triage one or in batch, mark on success, and auto-insert into the inbox.",
      "Copy-to-clipboard suggested replies and deep-linkable ticket details.",
    ],
    underspecified: {
      point: "The exact triage schema.",
      decision:
        "Inferred an education / tuition-support domain from the samples: 6 categories (Billing, Technical Support, Admissions, Account Access, General Inquiry, Complaint) and 4 priorities (Low → Urgent), enum-locked so the taxonomy is enforced. key_fields = transaction_code, email, phone, student_id.",
    },
  },
  {
    id: "knowledge",
    badge: "Use Case 2",
    name: "Grounded Knowledge Assistant",
    tagline: "Retrieval-augmented generation",
    blurb:
      "Ask questions against a document knowledge base. Answers are grounded in retrieved context with citations — and it clearly abstains when the answer isn't there.",
    icon: MessageSquareText,
    runPath: "/knowledge",
    gradient: "from-brand-amber to-brand-rust",
    tech: ["Flask", "ChromaDB", "nomic-embed-text", "Ollama · Qwen2.5", "React"],
    required: [
      "Given a small knowledge base of documents, let a user ask questions.",
      "Retrieve the relevant context.",
      "Answer grounded in it, with citations.",
      "Clearly say when the answer is not in the knowledge base.",
      "Present it in a simple chat UI.",
    ],
    built: [
      "PDF upload → chunk → embed with self-hosted nomic-embed-text → ChromaDB vector store.",
      "Top-k retrieval; answers grounded strictly in retrieved chunks, each shown as a citation card.",
      "Confidence-thresholded abstention: below the similarity cutoff it states the answer isn't in the documents instead of guessing.",
      "Every abstention is logged as an unanswered question for admins to review and close knowledge gaps.",
      "Clean chat UI with markdown answers, backend status, and a documents manager.",
    ],
    underspecified: {
      point: "What counts as “not in the knowledge base.”",
      decision:
        "Operationalized as the best cosine similarity falling below a threshold (default 0.45). Below it for every retrieved chunk, the assistant abstains explicitly and logs the question — abstention is preferred over a confident guess.",
    },
  },
];

export function getApp(id: string): AppCase | undefined {
  return APPS.find((a) => a.id === id);
}
