import { authorizedRequest } from "@/lib/authorized-client"

export type ClassSummary = {
  id: number
  name: string
  school: string
  city: string
  isOwner: boolean
  childrenCount: number
}

function getClasses(): Promise<ClassSummary[]> {
  return authorizedRequest<ClassSummary[]>("/classes")
}

export { getClasses }
