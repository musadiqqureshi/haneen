"use client";

import { useEffect, useState } from "react";

/** True only after the client has mounted — guards against hydration
 * mismatches when reading persisted (localStorage) store values. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
