import { authorizedRequest } from "@/lib/authorized-client";

export type AdminStats = {
  users: number;
  treasurers: number;
  activeFundraisings: number;
  finishedFundraisings: number;
  closedFundraisings: number;
  cancelledFundraisings: number;
  blockedUsers: number;
  blockedClasses: number;
  blockedFundraisings: number;
};

export type AdminMonth = {
  month: string;
  newUsers: number;
  newFundraisings: number;
  turnover: number;
};

export type AdminClassRef = {
  id: number;
  name: string;
  school: string;
  city: string;
  isBlocked: boolean;
};

export type AdminUserRef = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

export type AdminUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  classes: AdminClassRef[];
};

export type AdminTreasurer = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isBlocked: boolean;
  createdAt: string;
  classes: AdminClassRef[];
  fundraisingCount: number;
  collected: number;
};

export type AdminClass = {
  id: number;
  name: string;
  school: string;
  city: string;
  owner: AdminUserRef;
  memberCount: number;
  fundraisingCount: number;
  isBlocked: boolean;
  deletedAt: string | null;
  createdAt: string;
};

export type AdminFundraising = {
  id: number;
  name: string;
  status: "ACTIVE" | "CLOSED" | "CANCELLED";
  isBlocked: boolean;
  isClassBlocked: boolean;
  schoolClass: AdminClassRef;
  treasurer: AdminUserRef;
  amountPerChild: number;
  collected: number;
  balance: number;
  createdAt: string;
};

export type AdminRefundSummary = {
  refundedCount: number;
  refundedAmount: number;
};

export function getAdminStats(): Promise<AdminStats> {
  return authorizedRequest<AdminStats>("/admin/stats");
}

export function getAdminMonthlySummary(
  from?: string,
  to?: string,
): Promise<AdminMonth[]> {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return authorizedRequest<AdminMonth[]>(`/admin/reports/summary${suffix}`);
}

export function getAdminUsers(): Promise<AdminUser[]> {
  return authorizedRequest<AdminUser[]>("/admin/users");
}

export function getAdminTreasurers(): Promise<AdminTreasurer[]> {
  return authorizedRequest<AdminTreasurer[]>("/admin/treasurers");
}

export function getAdminClasses(): Promise<AdminClass[]> {
  return authorizedRequest<AdminClass[]>("/admin/classes");
}

export function getAdminFundraisings(): Promise<AdminFundraising[]> {
  return authorizedRequest<AdminFundraising[]>("/admin/fundraisings");
}

export function blockAdminUser(id: number): Promise<AdminUser> {
  return authorizedRequest<AdminUser>(`/admin/users/${id}/block`, {
    method: "POST",
  });
}

export function unblockAdminUser(id: number): Promise<AdminUser> {
  return authorizedRequest<AdminUser>(`/admin/users/${id}/block`, {
    method: "DELETE",
  });
}

export function blockAdminClass(id: number): Promise<AdminClass> {
  return authorizedRequest<AdminClass>(`/admin/classes/${id}/block`, {
    method: "POST",
  });
}

export function unblockAdminClass(id: number): Promise<AdminClass> {
  return authorizedRequest<AdminClass>(`/admin/classes/${id}/block`, {
    method: "DELETE",
  });
}

export function blockAdminFundraising(id: number): Promise<AdminFundraising> {
  return authorizedRequest<AdminFundraising>(
    `/admin/fundraisings/${id}/block`,
    { method: "POST" },
  );
}

export function unblockAdminFundraising(id: number): Promise<AdminFundraising> {
  return authorizedRequest<AdminFundraising>(
    `/admin/fundraisings/${id}/block`,
    { method: "DELETE" },
  );
}

export function refundAdminFundraising(
  id: number,
): Promise<AdminRefundSummary> {
  return authorizedRequest<AdminRefundSummary>(
    `/admin/fundraisings/${id}/refund`,
    { method: "POST" },
  );
}
