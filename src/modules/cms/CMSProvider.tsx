"use client";

import { createContext, useContext } from "react";
import { useUIStore } from "@/store/ui-store";
import { useSync } from "@/hooks/use-sync";
import type { CMSConnectionConfig } from "@/modules/cms/types";

interface CMSContextValue {
  config: CMSConnectionConfig;
}

const CMSContext = createContext<CMSContextValue>({ config: { provider: "demo" } });

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const cmsConfig = useUIStore((s) => s.cmsConfig);
  useSync();

  return (
    <CMSContext.Provider value={{ config: cmsConfig ?? { provider: "demo" } }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  return useContext(CMSContext);
}
