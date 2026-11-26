import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/page-header";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";
import { EmailForm } from "@/components/settings/email-form";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toast";
import {
  getCurrentUser,
  loadCurrentUser,
  subscribeCurrentUser,
} from "@/lib/current-user";

function SettingsPage() {
  const user = React.useSyncExternalStore(subscribeCurrentUser, getCurrentUser);

  React.useEffect(() => {
    void loadCurrentUser();
  }, []);

  const isAdmin = user?.role === "ADMIN";

  return (
    <AppShell activeId="settings">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Ustawienia konta"
          description="Zmień swoje dane, adres e-mail i hasło."
        />
        {user != null ? (
          <>
            <ProfileForm key={user.id} user={user} />
            <EmailForm user={user} />
            <PasswordForm />
            {isAdmin ? null : <DeleteAccountSection />}
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        )}
      </div>
      <Toaster />
    </AppShell>
  );
}

export { SettingsPage };
