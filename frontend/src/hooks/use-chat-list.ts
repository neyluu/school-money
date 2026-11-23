import * as React from "react";
import { useNavigate } from "react-router";
import { usePolling } from "@/hooks/use-polling";
import { ApiError } from "@/lib/api-client";
import { me } from "@/lib/auth";
import { getChats } from "@/lib/chat";
import type { Chat } from "@/lib/chat";

const REFRESH_INTERVAL_MS = 10000;

function useChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = React.useState<Chat[] | null>(null);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  const latestRequest = React.useRef(0);

  const handleError = React.useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        navigate("/login", { replace: true });
      }
    },
    [navigate],
  );

  React.useEffect(() => {
    let ignored = false;
    Promise.all([me(), getChats()])
      .then(([user, loaded]) => {
        if (!ignored) {
          setUserId(user.id);
          setChats(loaded);
        }
      })
      .catch((error: unknown) => {
        if (!ignored) {
          setFailed(true);
          handleError(error);
        }
      });
    return () => {
      ignored = true;
    };
  }, [handleError, reloadKey]);

  const refresh = React.useCallback(async () => {
    const request = ++latestRequest.current;
    try {
      const loaded = await getChats();
      if (request === latestRequest.current) {
        setChats(loaded);
      }
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const isReady = chats != null && userId != null;
  usePolling(refresh, REFRESH_INTERVAL_MS, isReady);

  function retry() {
    setFailed(false);
    setReloadKey((current) => current + 1);
  }

  function addChat(chat: Chat) {
    latestRequest.current += 1;
    setChats((current) => [
      chat,
      ...(current ?? []).filter((item) => item.id !== chat.id),
    ]);
  }

  return {
    chats: chats ?? [],
    userId,
    failed,
    isLoading: !isReady && !failed,
    refresh,
    retry,
    addChat,
  };
}

export { useChatList };
