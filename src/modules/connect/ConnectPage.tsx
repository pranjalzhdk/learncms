"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Database, ArrowRight } from "lucide-react";
import { validateCMSConnection } from "@/lib/api-client";
import { useUIStore } from "@/store/ui-store";
import type { CMSProviderType } from "@/modules/cms/types";
import { PROVIDER_META } from "@/modules/cms/types";
import { cn } from "@/lib/utils";

const PROVIDERS: CMSProviderType[] = ["sanity", "contentful", "strapi", "hygraph", "custom"];

interface ProviderForm {
  projectId: string;
  dataset: string;
  apiToken: string;
  apiUrl: string;
}

const EMPTY_FORM: ProviderForm = { projectId: "", dataset: "production", apiToken: "", apiUrl: "" };

export function ConnectPage() {
  const connect = useUIStore((s) => s.connect);
  const isConnecting = useUIStore((s) => s.isConnecting);
  const setConnecting = useUIStore((s) => s.setConnecting);
  const connectionError = useUIStore((s) => s.connectionError);
  const setConnectionError = useUIStore((s) => s.setConnectionError);

  const [activeProvider, setActiveProvider] = useState<CMSProviderType | null>(null);
  const [form, setForm] = useState<ProviderForm>(EMPTY_FORM);
  const [successProvider, setSuccessProvider] = useState<CMSProviderType | null>(null);

  const handleConnect = async (provider: CMSProviderType) => {
    setConnecting(true);
    setConnectionError(null);
    setSuccessProvider(null);

    const config = {
      provider,
      projectId: form.projectId || undefined,
      dataset: form.dataset || undefined,
      apiToken: form.apiToken || undefined,
      apiUrl: form.apiUrl || undefined,
    };

    try {
      const result = await validateCMSConnection(config);
      setSuccessProvider(provider);
      setTimeout(() => connect(config, result.stats), 1200);
    } catch (e) {
      setConnectionError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleDemoConnect = async () => {
    setConnecting(true);
    setConnectionError(null);
    try {
      const result = await validateCMSConnection({ provider: "demo" });
      connect({ provider: "demo" }, result.stats);
    } catch (e) {
      setConnectionError(e instanceof Error ? e.message : "Demo connection failed");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="px-8 py-6">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">LearnCMS</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center mb-12 max-w-lg">
          <h1 className="text-4xl sm:text-5xl font-semibold text-neutral-900 tracking-tight">
            Connect Your CMS
          </h1>
          <p className="text-neutral-500 mt-4 text-lg leading-relaxed">
            Link your headless CMS to start building a living website powered by your real content.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {PROVIDERS.map((provider) => {
            const meta = PROVIDER_META[provider];
            const isActive = activeProvider === provider;

            return (
              <div
                key={provider}
                className={cn(
                  "rounded-2xl border bg-white transition-all cursor-pointer",
                  isActive ? "border-neutral-900 shadow-lg col-span-1 sm:col-span-2 lg:col-span-1 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
                )}
                onClick={() => {
                  if (!isActive) {
                    setActiveProvider(provider);
                    setSuccessProvider(null);
                    setConnectionError(null);
                  }
                }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{meta.name}</p>
                      <p className="text-xs text-neutral-400">{meta.description}</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={false}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(provider === "sanity" || provider === "contentful") && (
                          <input
                            placeholder={provider === "sanity" ? "Project ID" : "Space ID"}
                            value={form.projectId}
                            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                          />
                        )}
                        {provider === "sanity" && (
                          <input
                            placeholder="Dataset"
                            value={form.dataset}
                            onChange={(e) => setForm({ ...form, dataset: e.target.value })}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                          />
                        )}
                        {(provider === "strapi" || provider === "custom" || provider === "hygraph") && (
                          <input
                            placeholder={provider === "hygraph" ? "Hygraph GraphQL URL" : "API URL"}
                            value={form.apiUrl}
                            onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                          />
                        )}
                        {provider !== "demo" && (
                          <input
                            placeholder="API Token"
                            type="password"
                            value={form.apiToken}
                            onChange={(e) => setForm({ ...form, apiToken: e.target.value })}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                          />
                        )}

                        <button
                          onClick={() => handleConnect(provider)}
                          disabled={isConnecting}
                          className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isConnecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : successProvider === provider ? (
                            <>
                              <Check className="w-4 h-4" /> Connected!
                            </>
                          ) : (
                            <>Connect <ArrowRight className="w-4 h-4" /></>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isActive && (
                    <p className="text-xs text-neutral-400 mt-1">Click to configure →</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {connectionError && (
          <p className="text-sm text-red-600 mt-4">{connectionError}</p>
        )}

        <div className="mt-10 pt-8 border-t border-neutral-200 w-full max-w-4xl text-center">
          <button
            onClick={handleDemoConnect}
            disabled={isConnecting}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <Database className="w-4 h-4" />
            Or try Demo Mode with local database
          </button>
        </div>
      </main>
    </div>
  );
}
