import { cn } from "cn";
import { ArrowLeft } from "lucide-react";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { DataState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChatMessages } from "@/hooks/use-chat-messages";
import type { Chat } from "@/lib/chat";

function ChatWindow({
  chat,
  userId,
  onBack,
  onActivity,
  className,
}: {
  chat: Chat;
  userId: number;
  onBack: () => void;
  onActivity: () => void;
  className?: string;
}) {
  const {
    messages,
    failed,
    hasOlder,
    isLoadingOlder,
    isSending,
    loadOlder,
    send,
    retry,
  } = useChatMessages(chat.id, onActivity);

  return (
    <Card className={cn("min-h-0 gap-0 py-0", className)}>
      <header className="flex shrink-0 items-center gap-3 border-b p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Wróć do listy rozmów"
          className="lg:hidden"
        >
          <ArrowLeft />
        </Button>
        <ChatAvatar user={chat.otherUser} className="size-9" />
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-base leading-snug">{chat.title}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {chat.type === "CLASS"
              ? "Skarbnik i rodzice klasy"
              : "Rozmowa prywatna"}
          </p>
        </div>
      </header>

      {messages != null ? (
        <>
          <ChatMessageList
            messages={messages}
            userId={userId}
            showNames={chat.type === "CLASS"}
            hasOlder={hasOlder}
            isLoadingOlder={isLoadingOlder}
            onLoadOlder={() => void loadOlder()}
          />
          {chat.canSend ? (
            <ChatComposer isSending={isSending} onSend={send} />
          ) : (
            <p className="shrink-0 border-t p-3 text-sm text-muted-foreground">
              Nie możesz już pisać do tej osoby, bo nie należycie do wspólnej
              klasy. Historia rozmowy pozostaje widoczna.
            </p>
          )}
        </>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <DataState
            isLoading={!failed}
            hasError={failed}
            isEmpty={false}
            emptyState={null}
            onRetry={retry}
          >
            {null}
          </DataState>
        </div>
      )}
    </Card>
  );
}

export { ChatWindow };
