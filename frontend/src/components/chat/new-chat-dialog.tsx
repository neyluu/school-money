import * as React from "react";
import { Search, SquarePen, UsersRound } from "lucide-react";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { fullName } from "@/components/chat/chat-format";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { getChatContacts, openPrivateChat } from "@/lib/chat";
import type { Chat, ChatUser } from "@/lib/chat";

function ContactPicker({ onOpened }: { onOpened: (chat: Chat) => void }) {
  const { data, error, isLoading, reload } = useAsyncData(getChatContacts);
  const [query, setQuery] = React.useState("");
  const [openingId, setOpeningId] = React.useState<number | null>(null);

  const search = query.trim().toLocaleLowerCase("pl-PL");
  const visible = (data ?? []).filter((user) =>
    fullName(user).toLocaleLowerCase("pl-PL").includes(search),
  );

  async function open(user: ChatUser) {
    setOpeningId(user.id);
    try {
      onOpened(await openPrivateChat(user.id));
    } catch {
      toast.add({
        title: "Nie udało się rozpocząć rozmowy. Spróbuj ponownie.",
        type: "error",
      });
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <InputGroup className="h-9">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj osoby"
          aria-label="Szukaj osoby"
        />
      </InputGroup>
      <DataState
        isLoading={isLoading}
        hasError={error != null}
        isEmpty={visible.length === 0}
        onRetry={reload}
        emptyState={
          <EmptyState
            icon={<UsersRound />}
            title={data?.length ? "Nie znaleziono osoby" : "Brak kontaktów"}
            description={
              data?.length
                ? "Spróbuj wpisać inne imię lub nazwisko."
                : "Możesz pisać do osób ze swoich klas."
            }
          />
        }
      >
        <ul className="flex max-h-[min(20rem,50dvh)] flex-col divide-y overflow-y-auto">
          {visible.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                disabled={openingId != null}
                onClick={() => void open(user)}
                className="flex w-full cursor-pointer items-center gap-3 p-2 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50"
              >
                <ChatAvatar user={user} className="size-9" />
                <span className="truncate text-sm font-medium">
                  {fullName(user)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  );
}

function NewChatDialog({ onOpened }: { onOpened: (chat: Chat) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <SquarePen data-icon="inline-start" />
        Nowa rozmowa
      </Button>
      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Nowa rozmowa</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Wybierz osobę, do której chcesz napisać prywatnie.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          {open ? (
            <ContactPicker
              onOpened={(chat) => {
                setOpen(false);
                onOpened(chat);
              }}
            />
          ) : null}
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export { NewChatDialog };
