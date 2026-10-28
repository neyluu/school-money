import { API_BASE_URL, ApiError, apiRequest } from "@/lib/api-client";
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

function childInitials(child: Child): string {
  return `${child.firstname.charAt(0)}${child.lastname.charAt(0)}`.toUpperCase();
}

function validateAvatar(file: File): string | undefined {
  if (!AVATAR_TYPES.includes(file.type)) {
    return "Wybierz zdjęcie w formacie PNG lub JPG.";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return "Zdjęcie może mieć maks. 5 MB.";
  }
  return undefined;
}

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

async function deleteChildAvatar(childId: number): Promise<void> {
  await apiRequest<void>(`/children/${childId}/avatar`, {
    method: "DELETE",
    token: getToken(),
  });
}

async function fetchChildAvatar(childId: number): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/children/${childId}/avatar`, {
    headers: token != null ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new ApiError(response.status, "Avatar could not be loaded");
  }
  return response.blob();
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

export {
  childInitials,
  createChild,
  deleteChildAvatar,
  fetchChildAvatar,
  getChildren,
  joinClass,
  uploadChildAvatar,
  validateAvatar,
};
