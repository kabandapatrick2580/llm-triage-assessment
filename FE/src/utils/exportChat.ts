import { jsPDF } from "jspdf";
import type { ChatMessage } from "@/types/chat";
import { formatDateTime } from "./formatDate";

/**
 * Export a conversation to a simple, readable PDF using jsPDF's text layout.
 * Keeps formatting minimal (no DOM capture) so it works headlessly.
 */
export function exportChatToPdf(messages: ChatMessage[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (lineHeight: number) => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (text: string, lineHeight: number) => {
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      addPageIfNeeded(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Knowledge Assistant — Conversation", margin, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Exported ${formatDateTime(new Date().toISOString())}`, margin, y);
  doc.setTextColor(0);
  y += 28;

  for (const msg of messages) {
    if (msg.pending) continue;
    const isUser = msg.role === "user";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(isUser ? 40 : 79);
    addPageIfNeeded(18);
    doc.text(isUser ? "You" : "Assistant", margin, y);
    y += 16;
    doc.setTextColor(0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const body =
      msg.error ||
      msg.content ||
      (msg.foundInKnowledgeBase === false
        ? "Information not found in the knowledge base."
        : "");
    writeLines(body, 15);

    // Citations
    if (msg.citations && msg.citations.length > 0) {
      y += 4;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(110);
      writeLines("Sources:", 13);
      msg.citations.forEach((c, i) => {
        writeLines(
          `  [${i + 1}] ${c.document} — Page ${c.page} (${c.chunk_id})`,
          13,
        );
      });
      doc.setTextColor(0);
    }

    y += 14;
  }

  doc.save(`knowledge-assistant-chat-${Date.now()}.pdf`);
}
