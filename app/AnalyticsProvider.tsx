"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

// Boots PostHog client-side. Renders nothing; pageviews (incl. SPA navigations)
// are captured automatically via posthog-js defaults.
export default function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
