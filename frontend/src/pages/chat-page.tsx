import { useSearchParams } from "react-router";
import { cn } from "cn";
import { MessageCircle } from "lucide-react";
import { ChatThreadList } from "@/components/chat/chat-thread-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { toast, Toaster } from "@/components/ui/toast";
import { useChatList } from "@/hooks/use-chat-list";
import type { Chat } from "@/lib/chat";

const CHAT_PARAM = "id";

function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get(CHAT_PARAM);
  const {
    chats,
    userId,
    failed,
    isLoading,
    refresh,
    retry,
    addChat,
    discardDraft,
    hide,
    isOpeningFocused,
  } = useChatList(requestedId != null ? Number(requestedId) : null);

  const selected = chats.find((chat) => String(chat.id) === requestedId);

  function selectChat(chat: Chat) {
    if (chat.id !== selected?.id) {
      discardDraft();
    }
    setSearchParams(
      { [CHAT_PARAM]: String(chat.id) },
      { replace: selected != null },
    );
  }

  function closeChat() {
    discardDraft();
    setSearchParams({}, { replace: true });
  }

  async function hideChat(chat: Chat) {
    if (chat.id === selected?.id) {
      closeChat();
    }
    const hidden = await hide(chat);
    toast.add(
      hidden
        ? {
            title: "Rozmowa została ukryta.",
            description: "Wróci na listę, gdy pojawi się nowa wiadomość.",
            type: "success",
          }
        : { title: "Nie udało się ukryć rozmowy.", type: "error" },
    );
  }

  return (
    <AppShell activeId="chat">
      <div className="flex h-[calc(100dvh-11rem)] min-h-64 flex-col gap-4 md:h-[calc(100dvh-8rem)] md:gap-6">
        <div className={cn("shrink-0", selected && "hidden lg:block")}>
          <PageHeader
            title="Czat"
            description="Rozmowy klasowe i prywatne ze skarbnikiem oraz rodzicami."
            actions={
              <NewChatDialog
                onOpened={(chat) => {
                  selectChat(chat);
                  addChat(chat);
                }}
              />
            }
          />
        </div>

        <DataState
          isLoading={isLoading}
          hasError={failed}
          isEmpty={false}
          emptyState={null}
          onRetry={retry}
        >
          {userId != null ? (
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <ChatThreadList
                chats={chats}
                userId={userId}
                selectedId={selected?.id ?? null}
                onSelect={selectChat}
                onHide={(chat) => void hideChat(chat)}
                className={cn(selected && "hidden lg:flex")}
              />
              {selected != null ? (
                <ChatWindow
                  key={selected.id}
                  chat={selected}
                  userId={userId}
                  onBack={closeChat}
                  onActivity={() => void refresh()}
                />
              ) : isOpeningFocused ? (
                <Card className="hidden items-center justify-center text-sm text-muted-foreground lg:flex">
                  Otwieranie rozmowy…
                </Card>
              ) : (
                <Card className="hidden items-center justify-center lg:flex">
                  <EmptyState
                    icon={<MessageCircle />}
                    title={
                      requestedId != null
                        ? "Nie ma takiej rozmowy"
                        : "Wybierz rozmowę"
                    }
                    description={
                      requestedId != null
                        ? "Rozmowa nie istnieje albo nie masz do niej dostępu."
                        : "Wybierz rozmowę z listy albo rozpocznij nową."
                    }
                  />
                </Card>
              )}
            </div>
          ) : null}
        </DataState>
      </div>
      <Toaster />
    </AppShell>
  );
}

export { ChatPage };
