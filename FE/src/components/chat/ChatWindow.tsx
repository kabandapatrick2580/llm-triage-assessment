import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatWindowProps {
  messages: ChatMessageType[];
  isResponding: boolean;
  onSend: (text: string) => void;
  onRegenerate: () => void;
}

/** Scrollable message list + composer, with auto-scroll on new content. */
export function ChatWindow({
  messages,
  isResponding,
  onSend,
  onRegenerate,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change or streaming updates land.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState onPick={onSend} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6">
            {messages.map((message, idx) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLast={idx === messages.length - 1}
                onRegenerate={onRegenerate}
                canRegenerate={!isResponding}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={onSend} disabled={isResponding} />
    </div>
  );
}
