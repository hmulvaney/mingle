import { Redis } from "@upstash/redis";

// Everything in Mingle lives for 48 hours, then disappears.
export const TTL_SECONDS = 48 * 60 * 60;

/**
 * Minimal key/value contract Mingle needs. Backed by Upstash Redis in
 * production; an in-memory map locally when Upstash isn't configured, so the
 * app runs with zero setup. Both honor the same 48h TTL.
 */
interface Store {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

function createRedisStore(): Store {
  const redis = Redis.fromEnv();
  return {
    async get<T>(key: string) {
      return (await redis.get<T>(key)) ?? null;
    },
    async set<T>(key: string, value: T, ttlSeconds: number) {
      await redis.set(key, value, { ex: ttlSeconds });
    },
  };
}

function createMemoryStore(): Store {
  const map = new Map<string, { value: unknown; expiresAt: number }>();
  return {
    async get<T>(key: string) {
      const entry = map.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        map.delete(key);
        return null;
      }
      return entry.value as T;
    },
    async set<T>(key: string, value: T, ttlSeconds: number) {
      map.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
  };
}

const usingRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// Reuse a single store across hot reloads / serverless invocations so the
// in-memory fallback doesn't reset on every request in dev.
const globalForStore = globalThis as unknown as { __mingleStore?: Store };

export const store: Store =
  globalForStore.__mingleStore ??
  (globalForStore.__mingleStore = usingRedis
    ? createRedisStore()
    : createMemoryStore());

export const storageBackend = usingRedis ? "redis" : "memory";
