"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/ui-store";

export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useUIStore.persist.onFinishHydration(() => setHydrated(true));
    if (useUIStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useUIStore.persist.rehydrate();
    }
    return unsub;
  }, []);

  return hydrated;
}
