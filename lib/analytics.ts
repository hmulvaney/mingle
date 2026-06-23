import posthog from "posthog-js";

// Public, write-only client token — safe to ship in the browser bundle.
// (PostHog labels it "Safe to use in public apps".) Override via env if needed.
const KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  "phc_r6rwo4RFGc36w5T25AXWbze7CAYTdd6VyJ2H7LhYpdgJ";
const HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let started = false;

// Initialise once, in the browser, on the real domain only — so local dev
// clicks don't pollute the production analytics.
export function initAnalytics() {
  if (started || typeof window === "undefined") return;
  if (window.location.hostname === "localhost") return;
  started = true;
  posthog.init(KEY, {
    api_host: HOST,
    defaults: "2025-05-24",
  });
  // Stamp every event so this project can hold several personal apps and stay
  // filterable by `app` (e.g. app = "mingle").
  posthog.register({ app: "mingle" });
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!started) return;
  posthog.capture(event, props);
}
