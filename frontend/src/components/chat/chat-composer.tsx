import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_MAX_LENGTH } from "@/lib/chat";

const COUNTER_VISIBLE_FROM = MESSAGE_MAX_LENGTH - 200;

function ChatComposer({
  isSending,
  onSend,
}: {
  isSending: boolean;
  onSend: (content: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = React.useState("");
  const canSend = draft.trim() !== "" && !isSending;

  async function submit() {
    if (!canSend) {
      return;
    }
    if (await onSend(draft.trim())) {
      setDraft("");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    void submit();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex shrink-0 flex-col gap-1 border-t p-3"
    >
      <div className="flex items-end gap-2">
        <Textarea
          rows={1}
          value={draft}
          readOnly={isSending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MESSAGE_MAX_LENGTH}
          enterKeyHint="send"
          placeholder="Napisz wiadomość…"
          aria-label="Treść wiadomości"
          className="max-h-32 min-h-9 flex-1 resize-none py-1.5"
        />
        <Button
          type="submit"
          size="lg"
          disabled={!canSend}
          aria-label="Wyślij"
          className="px-3"
        >
          <Send />
          <span className="hidden sm:inline">Wyślij</span>
        </Button>
      </div>
      {draft.length >= COUNTER_VISIBLE_FROM ? (
        <p className="text-right text-xs text-muted-foreground">
          {draft.length} / {MESSAGE_MAX_LENGTH}
        </p>
      ) : null}
    </form>
  );
}

export { ChatComposer };
