import * as React from "react";
import { cn } from "cn";
import { MessageCircle, Search } from "lucide-react";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { formatListTime } from "@/components/chat/chat-format";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { Chat } from "@/lib/chat";

function messagePreview(chat: Chat, userId: number): string {
  const message = chat.lastMessage;
  if (message == null) {
    return "Brak wiadomości";
  }
  if (message.sender.id === userId) {
    return `Ty: ${message.content}`;
  }
  return chat.type === "CLASS"
    ? `${message.sender.firstName}: ${message.content}`
    : message.content;
}

function ThreadRow({
  chat,
  userId,
  isSelected,
  onSelect,
}: {
  chat: Chat;
  userId: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isUnread = chat.unreadCount > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          isSelected && "bg-accent hover:bg-accent",
        )}
      >
        <ChatAvatar user={chat.otherUser} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{chat.title}</span>
            {chat.lastMessage != null ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatListTime(chat.lastMessage.createdAt)}
              </span>
            ) : null}
          </span>
          <span className="flex h-5 items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-xs text-muted-foreground",
                isUnread && "font-medium text-foreground",
              )}
            >
              {messagePreview(chat, userId)}
            </span>
            {isUnread ? (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                <span className="sr-only">Nieprzeczytane: </span>
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            ) : null}
          </span>
        </span>
      </button>
    </li>
  );
}

function ChatThreadList({
  chats,
  userId,
  selectedId,
  onSelect,
  className,
}: {
  chats: Chat[];
  userId: number;
  selectedId: number | null;
  onSelect: (chat: Chat) => void;
  className?: string;
}) {
  const [query, setQuery] = React.useState("");

  const search = query.trim().toLocaleLowerCase("pl-PL");
  const visible = chats.filter((chat) =>
    chat.title.toLocaleLowerCase("pl-PL").includes(search),
  );

  return (
    <Card className={cn("min-h-0 gap-0 py-0", className)}>
      <div className="border-b p-3">
        <InputGroup className="h-9">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj rozmów"
            aria-label="Szukaj rozmów"
          />
        </InputGroup>
      </div>

      <nav aria-label="Rozmowy" className="min-h-0 flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <EmptyState
            icon={<MessageCircle />}
            title="Nie masz jeszcze rozmów"
            description="Czat klasy pojawi się, gdy założysz klasę albo skarbnik przyjmie do niej Twoje dziecko."
          />
        ) : visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Brak rozmów o takiej nazwie.
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {visible.map((chat) => (
              <ThreadRow
                key={chat.id}
                chat={chat}
                userId={userId}
                isSelected={chat.id === selectedId}
                onSelect={() => onSelect(chat)}
              />
            ))}
          </ul>
        )}
      </nav>
    </Card>
  );
}

export { ChatThreadList };
