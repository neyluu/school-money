import * as React from "react";
import { cn } from "cn";
import { ArrowDown, MessageCircle } from "lucide-react";
import {
  formatDay,
  formatTime,
  fullName,
  isSameDay,
} from "@/components/chat/chat-format";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/chat";

const NEAR_BOTTOM_PX = 80;

function MessageItem({
  message,
  previous,
  isMine,
  showNames,
}: {
  message: ChatMessage;
  previous: ChatMessage | undefined;
  isMine: boolean;
  showNames: boolean;
}) {
  const startsDay =
    previous == null || !isSameDay(previous.createdAt, message.createdAt);
  const startsGroup = startsDay || previous.sender.id !== message.sender.id;

  return (
    <li className={cn("flex flex-col", startsGroup ? "mt-4" : "mt-1.5")}>
      {startsDay ? (
        <p className="mb-3 text-center text-xs text-muted-foreground">
          {formatDay(message.createdAt)}
        </p>
      ) : null}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-0.5 sm:max-w-[75%]",
          isMine ? "items-end self-end" : "items-start self-start",
        )}
      >
        {showNames && !isMine && startsGroup ? (
          <span className="text-xs font-medium text-muted-foreground">
            {fullName(message.sender)}
          </span>
        ) : null}
        <p
          className={cn(
            "max-w-full rounded-lg px-3 py-2 text-sm wrap-anywhere whitespace-pre-wrap",
            isMine
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
          )}
        >
          {message.content}
        </p>
        <time
          dateTime={message.createdAt}
          className="text-[11px] text-muted-foreground"
        >
          {formatTime(message.createdAt)}
        </time>
      </div>
    </li>
  );
}

function ChatMessageList({
  messages,
  userId,
  showNames,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
}: {
  messages: ChatMessage[];
  userId: number;
  showNames: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isAtBottom = React.useRef(true);
  const distanceFromBottom = React.useRef(0);
  const previousEdges = React.useRef<{ first?: number; last?: number }>({});
  const [seenId, setSeenId] = React.useState(messages.at(-1)?.id ?? 0);

  const first = messages[0]?.id;
  const last = messages.at(-1);
  const hasUnseen =
    last != null && last.id > seenId && last.sender.id !== userId;

  function handleScroll() {
    const element = scrollRef.current;
    if (element == null) {
      return;
    }
    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    distanceFromBottom.current = distance;
    isAtBottom.current = distance < NEAR_BOTTOM_PX;
    if (isAtBottom.current && last != null) {
      setSeenId(last.id);
    }
  }

  React.useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element == null) {
      return;
    }
    const previous = previousEdges.current;
    previousEdges.current = { first, last: last?.id };

    if (last?.id !== previous.last) {
      if (isAtBottom.current || last?.sender.id === userId) {
        element.scrollTop = element.scrollHeight;
      }
    } else if (first !== previous.first) {
      element.scrollTop =
        element.scrollHeight -
        element.clientHeight -
        distanceFromBottom.current;
    }
  }, [first, last, userId]);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (element == null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (isAtBottom.current) {
        element.scrollTop = element.scrollHeight;
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function scrollToBottom() {
    const element = scrollRef.current;
    if (element != null) {
      element.scrollTop = element.scrollHeight;
    }
    setSeenId(last?.id ?? 0);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 sm:px-4"
      >
        {hasOlder ? (
          <div className="flex justify-center pt-3">
            <Button
              variant="ghost"
              size="sm"
              loading={isLoadingOlder}
              onClick={onLoadOlder}
            >
              Pokaż starsze wiadomości
            </Button>
          </div>
        ) : null}
        {messages.length === 0 ? (
          <EmptyState
            icon={<MessageCircle />}
            title="Brak wiadomości"
            description="Napisz pierwszą wiadomość w tej rozmowie."
            className="h-full"
          />
        ) : (
          <ol role="log" aria-label="Wiadomości" className="flex flex-col">
            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                previous={messages[index - 1]}
                isMine={message.sender.id === userId}
                showNames={showNames}
              />
            ))}
          </ol>
        )}
      </div>
      {hasUnseen ? (
        <Button
          size="sm"
          onClick={scrollToBottom}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 active:not-aria-[haspopup]:translate-y-0"
        >
          <ArrowDown />
          Nowe wiadomości
        </Button>
      ) : null}
    </div>
  );
}

export { ChatMessageList };
