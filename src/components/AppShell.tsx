"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/ui-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import { ConnectPage } from "@/modules/connect/ConnectPage";
import { LearnWorkspace } from "@/components/workspace/LearnWorkspace";
import { CMSProvider } from "@/modules/cms/CMSProvider";

export function AppShell() {
  const hydrated = useStoreHydrated();
  const isConnected = useUIStore((s) => s.isConnected);
  const cmsConfig = useUIStore((s) => s.cmsConfig);
  const viewMode = useUIStore((s) => s.viewMode);
  const disconnect = useUIStore((s) => s.disconnect);
  const [dbOk, setDbOk] = useState(true);

  useEffect(() => {
    if (hydrated && isConnected && viewMode === "connect") {
      useUIStore.setState({ viewMode: "learn" });
    }
  }, [hydrated, isConnected, viewMode]);

  useEffect(() => {
    if (!hydrated || !isConnected) return;
    fetch("/api/content", {
      headers: cmsConfig ? {
        "x-cms-provider": cmsConfig.provider,
        ...(cmsConfig.projectId && { "x-cms-project-id": cmsConfig.projectId }),
        ...(cmsConfig.dataset && { "x-cms-dataset": cmsConfig.dataset }),
        ...(cmsConfig.apiToken && { "x-cms-token": cmsConfig.apiToken }),
        ...(cmsConfig.apiUrl && { "x-cms-api-url": cmsConfig.apiUrl }),
      } : { "x-cms-provider": "demo" },
    })
      .then((r) => setDbOk(r.ok))
      .catch(() => setDbOk(false));
  }, [hydrated, isConnected, cmsConfig]);

  if (!hydrated || !isConnected) {
    return <ConnectPage />;
  }

  if (!dbOk) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white border border-neutral-200 rounded-2xl p-8">
          <p className="text-4xl mb-3">⚠️</p>
          <h2 className="text-lg font-semibold text-neutral-900">Database connection failed</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Demo mode needs a working database. Check DATABASE_URL is set on your host, or reconnect.
          </p>
          <button
            onClick={disconnect}
            className="mt-6 px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-xl hover:bg-neutral-800"
          >
            Back to Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <CMSProvider>
      <LearnWorkspace />
    </CMSProvider>
  );
}
