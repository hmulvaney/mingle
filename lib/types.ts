export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  company: string;
  role: string;
  joinedAt: number;
}

export interface Group {
  id: string;
  name: string;
  createdAt: number;
  expiresAt: number;
  members: Member[];
}

export type MemberInput = Omit<Member, "id" | "joinedAt">;
