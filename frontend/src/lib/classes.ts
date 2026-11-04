import { authorizedRequest } from "@/lib/authorized-client"

export type MembershipStatus = "PENDING" | "ACCEPTED"

export type ClassChildMembership = {
  classId: number
  childId: number
  childFirstName: string
  childLastName: string
  status: MembershipStatus
  requestedAt: string
  decidedAt: string | null
}

export type ClassSummary = {
  id: number
  name: string
  school: string
  city: string
  isOwner: boolean
  childrenCount: number
  myChildren: ClassChildMembership[]
}

function getClasses(): Promise<ClassSummary[]> {
  return authorizedRequest<ClassSummary[]>("/classes")
}

export { getClasses }
