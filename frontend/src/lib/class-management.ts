import { apiRequest } from "@/lib/api-client";
import { getToken } from "@/lib/auth-store";
import type { MembershipStatus } from "@/lib/classes";
import type { FundraisingListItem } from "@/lib/fundraising";

export type ClassBasics = Pick<ClassSummary, "id" | "name" | "school" | "city">;

export type Person = {
  id: number;
  firstName: string;
  lastName: string;
};

export type ClassMembershipInfo = {
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
  owner: Person;
  childrenCount: number;
  myChildren: ClassMembershipInfo[];
  deletedAt: string | null;
};

export type ClassChild = {
  id: number;
  firstName: string;
  lastName: string;
  avatarId: number | null;
  parent: Person;
};

export type ClassDetails = {
  id: number;
  name: string;
  school: string;
  city: string;
  accessCode: string;
  isOwner: boolean;
  owner: Person;
  children: ClassChild[];
  createdAt: string;
};

export type PendingMembership = {
  child: ClassChild;
  parentEmail: string;
  requestedAt: string;
};

export type ClassInput = {
  name: string;
  school: string;
  city: string;
};

async function getClassSummaries(): Promise<ClassSummary[]> {
  return apiRequest<ClassSummary[]>("/classes", { token: getToken() });
}

async function getClassDetails(classId: number): Promise<ClassDetails> {
  return apiRequest<ClassDetails>(`/classes/${classId}`, {
    token: getToken(),
  });
}

async function createClass(input: ClassInput): Promise<ClassDetails> {
  return apiRequest<ClassDetails>("/classes", {
    method: "POST",
    body: input,
    token: getToken(),
  });
}

async function updateClass(
  classId: number,
  input: Partial<ClassInput>,
): Promise<ClassDetails> {
  return apiRequest<ClassDetails>(`/classes/${classId}`, {
    method: "PATCH",
    body: input,
    token: getToken(),
  });
}

async function deleteClass(classId: number): Promise<void> {
  await apiRequest<void>(`/classes/${classId}`, {
    method: "DELETE",
    token: getToken(),
  });
}

async function getPendingMemberships(
  classId: number,
): Promise<PendingMembership[]> {
  return apiRequest<PendingMembership[]>(`/classes/${classId}/membership`, {
    token: getToken(),
  });
}

async function acceptMembership(
  classId: number,
  childId: number,
): Promise<ClassMembershipInfo> {
  return apiRequest<ClassMembershipInfo>(
    `/classes/${classId}/membership/${childId}`,
    { method: "POST", token: getToken() },
  );
}

async function rejectMembership(
  classId: number,
  childId: number,
): Promise<ClassMembershipInfo> {
  return apiRequest<ClassMembershipInfo>(
    `/classes/${classId}/membership/${childId}/reject`,
    { method: "POST", token: getToken() },
  );
}

async function removeMembership(
  classId: number,
  childId: number,
): Promise<void> {
  await apiRequest<void>(`/classes/${classId}/membership/${childId}`, {
    method: "DELETE",
    token: getToken(),
  });
}

async function regenerateAccessCode(
  classId: number,
): Promise<{ accessCode: string }> {
  return apiRequest<{ accessCode: string }>(
    `/classes/${classId}/access-code/regenerate`,
    { method: "POST", token: getToken() },
  );
}

async function getClassFundraisings(
  classId: number,
): Promise<FundraisingListItem[]> {
  return apiRequest<FundraisingListItem[]>(`/fundraisings?classId=${classId}`, {
    token: getToken(),
  });
}

export {
  acceptMembership,
  createClass,
  deleteClass,
  getClassDetails,
  getClassSummaries,
  getPendingMemberships,
  regenerateAccessCode,
  rejectMembership,
  removeMembership,
  updateClass,
  getClassFundraisings,
};
