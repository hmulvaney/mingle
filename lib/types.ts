export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  joinedAt: number;
}

export interface Group {
  id: string;
  name: string;
  createdAt: number;
  expiresAt: number;
  members: Member[];
}

export type NewMember = Omit<Member, "id" | "joinedAt">;
