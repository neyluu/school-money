import { ApiError, apiRequest } from "@/lib/api-client";
import { getToken } from "@/lib/auth-store";

export type MembershipStatus =
  "PENDING" | "ACCEPTED" | "REJECTED" | "CLASS_DELETED";

export type ClassMembership = {
  classId: number;
  childId: number;
  childFirstName: string;
  childLastName: string;
  status: MembershipStatus;
  requestedAt: string;
  decidedAt: string | null;
};

export type ClassSummary = {
  id: number;
  name: string;
  school: string;
  city: string;
  isOwner: boolean;
  childrenCount: number;
  myChildren: ClassMembership[];
  deletedAt: string | null;
};

export type ChildClassInfo = {
  classId: number;
  className: string;
  school: string;
  status: MembershipStatus;
};

export const STATUS_LABELS: Record<MembershipStatus, string> = {
  PENDING: "Oczekuje",
  ACCEPTED: "Zaakceptowane",
  REJECTED: "Odrzucone",
  CLASS_DELETED: "Klasa usunięta",
};

async function getClasses(): Promise<ClassSummary[]> {
  try {
    return await apiRequest<ClassSummary[]>("/classes", { token: getToken() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

async function removeChildFromClass(
  classId: number,
  childId: number,
): Promise<void> {
  await apiRequest<void>(`/classes/${classId}/child/${childId}`, {
    method: "DELETE",
    token: getToken(),
  });
}

function groupClassesByChild(
  classes: ClassSummary[],
): Map<number, ChildClassInfo[]> {
  const map = new Map<number, ChildClassInfo[]>();
  for (const cls of classes) {
    for (const membership of cls.myChildren ?? []) {
      const list = map.get(membership.childId) ?? [];
      list.push({
        classId: cls.id,
        className: cls.name,
        school: cls.school,
        status: membership.status,
      });
      map.set(membership.childId, list);
    }
  }
  return map;
}

export { getClasses, groupClassesByChild, removeChildFromClass };
