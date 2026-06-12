"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import { ConnectPage } from "@/modules/connect/ConnectPage";
import { LearnWorkspace } from "@/components/workspace/LearnWorkspace";
import { CMSProvider } from "@/modules/cms/CMSProvider";

export function AppShell() {
  const hydrated = useStoreHydrated();
  const isConnected = useUIStore((s) => s.isConnected);
  const viewMode = useUIStore((s) => s.viewMode);

  useEffect(() => {
    if (hydrated && isConnected && viewMode === "connect") {
      useUIStore.setState({ viewMode: "learn" });
    }
  }, [hydrated, isConnected, viewMode]);

  // Always render ConnectPage until persisted state rehydrates — matches SSR output.
  if (!hydrated || !isConnected) {
    return <ConnectPage />;
  }

  return (
    <CMSProvider>
      <LearnWorkspace />
    </CMSProvider>
  );
}
