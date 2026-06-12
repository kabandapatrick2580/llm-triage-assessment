import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";
import { exportChatToPdf } from "@/utils/exportChat";
import { notify } from "@/utils/notifications";

export function ChatPage() {
  const { messages, ask, regenerate, clear, isResponding } = useChat();
  const hasMessages = messages.length > 0;

  const handleExport = () => {
    if (!hasMessages) return;
    try {
      exportChatToPdf(messages);
      notify.success("Chat exported as PDF");
    } catch {
      notify.error("Could not export chat");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat toolbar */}
      <div className="flex items-center justify-end gap-1 border-b border-border px-4 py-2 md:px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={!hasMessages}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export conversation as PDF</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              disabled={!hasMessages}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear conversation</TooltipContent>
        </Tooltip>
      </div>

      <div className="min-h-0 flex-1">
        <ChatWindow
          messages={messages}
          isResponding={isResponding}
          onSend={ask}
          onRegenerate={regenerate}
        />
      </div>
    </div>
  );
}
