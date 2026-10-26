import { ApiError, apiRequest } from "@/lib/api-client";
import { getToken } from "@/lib/auth-store";

export type Child = {
  id: number;
  firstname: string;
  lastname: string;
  birthDate: string;
  avatarId: number | null;
};

export type ClassMembership = {
  classId: number;
  childId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CLASS_DELETED";
};

export const AVATAR_TYPES = ["image/png", "image/jpeg"];
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

async function getChildren(): Promise<Child[]> {
  try {
    return await apiRequest<Child[]>("/children", { token: getToken() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

async function createChild(input: {
  firstname: string;
  lastname: string;
  birthDate: string;
}): Promise<Child> {
  return apiRequest<Child>("/children", {
    method: "POST",
    body: input,
    token: getToken(),
  });
}

async function uploadChildAvatar(childId: number, file: File): Promise<void> {
  const body = new FormData();
  body.append("file", file);
  await apiRequest<unknown>(`/children/${childId}/avatar`, {
    method: "PUT",
    body,
    token: getToken(),
  });
}

async function joinClass(
  accessCode: string,
  childId: number,
): Promise<ClassMembership> {
  return apiRequest<ClassMembership>("/classes/join", {
    method: "POST",
    body: { accessCode, childId },
    token: getToken(),
  });
}

export { createChild, getChildren, joinClass, uploadChildAvatar };
