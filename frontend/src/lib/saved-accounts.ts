import { authorizedRequest } from "@/lib/authorized-client";
import { normalizeIban } from "@/lib/iban";

export type SavedAccount = {
  id: number;
  recipientName: string;
  iban: string;
};

export type SavedAccountInput = {
  recipientName: string;
  iban: string;
};

function getSavedAccounts(): Promise<SavedAccount[]> {
  return authorizedRequest<SavedAccount[]>("/payments/saved-accounts");
}

function addSavedAccount(input: SavedAccountInput): Promise<SavedAccount> {
  return authorizedRequest<SavedAccount>("/payments/saved-accounts", {
    method: "POST",
    body: {
      recipientName: input.recipientName.trim(),
      iban: normalizeIban(input.iban),
    },
  });
}

function removeSavedAccount(id: number): Promise<void> {
  return authorizedRequest<void>(`/payments/saved-accounts/${id}`, {
    method: "DELETE",
  });
}

export { addSavedAccount, getSavedAccounts, removeSavedAccount };
