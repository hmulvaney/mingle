import { store, TTL_SECONDS } from "./store";
import type { Group, Member, MemberInput } from "./types";

function sanitize(input: MemberInput): Omit<Member, "id" | "joinedAt"> {
  return {
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 200),
    phone: input.phone.trim().slice(0, 40),
    linkedin: input.linkedin.trim().slice(0, 200),
    company: input.company.trim().slice(0, 120),
    role: input.role.trim().slice(0, 120),
  };
}

// Namespaced so Mingle can safely share a single Redis database with other apps.
const ACTIVE_GROUP_KEY = "mingle:active_group";
const groupKey = (id: string) => `mingle:group:${id}`;

const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no look-alikes

function randomId(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ID_ALPHABET[b % ID_ALPHABET.length];
  return out;
}

export async function createGroup(name: string): Promise<Group> {
  const now = Date.now();
  const group: Group = {
    id: randomId(6),
    name: name.trim().slice(0, 80) || "Untitled event",
    createdAt: now,
    expiresAt: now + TTL_SECONDS * 1000,
    members: [],
  };
  await store.set(groupKey(group.id), group, TTL_SECONDS);
  // This group becomes the one the permanent QR points people at.
  await store.set(ACTIVE_GROUP_KEY, group.id, TTL_SECONDS);
  return group;
}

export async function getGroup(id: string): Promise<Group | null> {
  return store.get<Group>(groupKey(id));
}

export async function getActiveGroup(): Promise<Group | null> {
  const id = await store.get<string>(ACTIVE_GROUP_KEY);
  if (!id) return null;
  return getGroup(id);
}

// End the current event: home returns to the "Start a new group" state. The
// group's own data still lives out its 48h TTL; only the active pointer clears.
export async function clearActiveGroup(): Promise<void> {
  await store.del(ACTIVE_GROUP_KEY);
}

export async function addMember(
  id: string,
  input: MemberInput,
): Promise<Group | null> {
  const group = await getGroup(id);
  if (!group) return null;

  const member: Member = {
    id: randomId(8),
    ...sanitize(input),
    joinedAt: Date.now(),
  };
  group.members.push(member);
  await store.set(groupKey(group.id), group, TTL_SECONDS);
  return group;
}

export async function updateMember(
  id: string,
  memberId: string,
  input: MemberInput,
): Promise<Group | null> {
  const group = await getGroup(id);
  if (!group) return null;
  const member = group.members.find((m) => m.id === memberId);
  if (!member) return null;

  Object.assign(member, sanitize(input));
  await store.set(groupKey(group.id), group, TTL_SECONDS);
  return group;
}

export async function removeMember(
  id: string,
  memberId: string,
): Promise<Group | null> {
  const group = await getGroup(id);
  if (!group) return null;
  group.members = group.members.filter((m) => m.id !== memberId);
  await store.set(groupKey(group.id), group, TTL_SECONDS);
  return group;
}
