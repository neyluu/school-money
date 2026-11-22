import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "@/components/ui/toast";
import { usePolling } from "@/hooks/use-polling";
import { ApiError } from "@/lib/api-client";
import {
  getMessages,
  markAsRead,
  MESSAGES_PAGE_SIZE,
  sendMessage,
} from "@/lib/chat";
import type { ChatMessage } from "@/lib/chat";

const POLL_INTERVAL_MS = 3000;
const POLL_OVERLAP = 10;

function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const known = new Set(current.map((message) => message.id));
  const added = incoming.filter((message) => !known.has(message.id));
  return added.length === 0
    ? current
    : [...current, ...added].sort((a, b) => a.id - b.id);
}

function useChatMessages(chatId: number, onActivity: () => void) {
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<ChatMessage[] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [hasOlder, setHasOlder] = React.useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  const fetchedIds = React.useRef<number[]>([]);

  const notifyActivity = React.useEffectEvent(onActivity);

  React.useEffect(() => {
    let ignored = false;
    getMessages(chatId)
      .then(async (loaded) => {
        if (ignored) {
          return;
        }
        fetchedIds.current = loaded.map((message) => message.id);
        setMessages(loaded);
        setHasOlder(loaded.length === MESSAGES_PAGE_SIZE);
        await markAsRead(chatId).catch(() => undefined);
        if (!ignored) {
          notifyActivity();
        }
      })
      .catch((error: unknown) => {
        if (ignored) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setFailed(true);
      });
    return () => {
      ignored = true;
    };
  }, [chatId, navigate, reloadKey]);

  function handleError(error: unknown, title?: string) {
    if (error instanceof ApiError && error.status === 401) {
      navigate("/login", { replace: true });
      return;
    }
    if (error instanceof ApiError && [403, 404].includes(error.status)) {
      onActivity();
    }
    if (title != null) {
      toast.add({ title, type: "error" });
    }
  }

  async function poll() {
    try {
      const after = fetchedIds.current.at(-POLL_OVERLAP) ?? 0;
      const incoming = await getMessages(chatId, { after });
      const known = new Set(fetchedIds.current);
      const added = incoming.filter((message) => !known.has(message.id));
      if (added.length === 0) {
        return;
      }

      fetchedIds.current = [
        ...fetchedIds.current,
        ...added.map((message) => message.id),
      ].sort((a, b) => a - b);
      setMessages((current) => mergeMessages(current ?? [], added));
      await markAsRead(chatId);
      onActivity();
    } catch (error) {
      handleError(error);
    }
  }

  usePolling(poll, POLL_INTERVAL_MS, messages != null);

  async function loadOlder() {
    const oldest = messages?.[0];
    if (oldest == null || isLoadingOlder) {
      return;
    }
    setIsLoadingOlder(true);
    try {
      const older = await getMessages(chatId, { before: oldest.id });
      setMessages((current) => mergeMessages(current ?? [], older));
      setHasOlder(older.length === MESSAGES_PAGE_SIZE);
    } catch (error) {
      handleError(error, "Nie udało się wczytać starszych wiadomości.");
    } finally {
      setIsLoadingOlder(false);
    }
  }

  async function send(content: string): Promise<boolean> {
    setIsSending(true);
    try {
      const sent = await sendMessage(chatId, content);
      setMessages((current) => mergeMessages(current ?? [], [sent]));
      onActivity();
      return true;
    } catch (error) {
      handleError(error, "Nie udało się wysłać wiadomości.");
      return false;
    } finally {
      setIsSending(false);
    }
  }

  function retry() {
    setFailed(false);
    setReloadKey((current) => current + 1);
  }

  return {
    messages,
    failed,
    hasOlder,
    isLoadingOlder,
    isSending,
    loadOlder,
    send,
    retry,
  };
}

export { useChatMessages };
