import { store, TTL_SECONDS } from "./store";
import type { Group, Member, NewMember } from "./types";

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

export async function addMember(
  id: string,
  input: NewMember,
): Promise<Group | null> {
  const group = await getGroup(id);
  if (!group) return null;

  const member: Member = {
    id: randomId(8),
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 200),
    phone: input.phone.trim().slice(0, 40),
    linkedin: input.linkedin.trim().slice(0, 200),
    joinedAt: Date.now(),
  };
  group.members.push(member);
  await store.set(groupKey(group.id), group, TTL_SECONDS);
  return group;
}
