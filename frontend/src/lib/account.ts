import type { AuthUser } from "@/lib/auth";
import { authorizedRequest } from "@/lib/authorized-client";

function updateProfile(firstName: string, lastName: string): Promise<AuthUser> {
  return authorizedRequest<AuthUser>("/auth/me", {
    method: "PATCH",
    body: { firstName, lastName },
  });
}

function changeEmail(
  email: string,
  currentPassword: string,
): Promise<AuthUser> {
  return authorizedRequest<AuthUser>("/auth/me/email", {
    method: "PUT",
    body: { email, currentPassword },
  });
}

function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return authorizedRequest<void>("/auth/me/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}

function deleteAccount(password: string): Promise<void> {
  return authorizedRequest<void>("/auth/me", {
    method: "DELETE",
    body: { password },
  });
}

export { changeEmail, changePassword, deleteAccount, updateProfile };
