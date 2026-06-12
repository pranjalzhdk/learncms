import type { CMSConnectionConfig, CMSProviderInterface } from "@/modules/cms/types";
import { DemoCMSProvider } from "./demo-provider";
import { WriteFallbackProvider } from "./write-fallback-provider";
import {
  SanityCMSProvider,
  ContentfulCMSProvider,
  StrapiCMSProvider,
  HygraphCMSProvider,
} from "./external-providers";

function createPrimaryProvider(config: CMSConnectionConfig): CMSProviderInterface {
  switch (config.provider) {
    case "sanity":
      return new SanityCMSProvider(config);
    case "contentful":
      return new ContentfulCMSProvider(config);
    case "strapi":
      return new StrapiCMSProvider(config);
    case "hygraph":
      return new HygraphCMSProvider(config);
    case "custom":
      return new StrapiCMSProvider({ ...config, provider: "strapi" });
    default:
      return new DemoCMSProvider();
  }
}

export function createCMSProvider(config?: CMSConnectionConfig): CMSProviderInterface {
  const resolved = config ?? { provider: "demo" as const };

  if (resolved.provider === "demo") {
    return new DemoCMSProvider();
  }

  return new WriteFallbackProvider(createPrimaryProvider(resolved));
}

export function parseCMSConfig(headers: Headers): CMSConnectionConfig {
  const provider = headers.get("x-cms-provider") ?? "demo";

  if (provider === "demo") {
    return { provider: "demo" };
  }

  return {
    provider: provider as CMSConnectionConfig["provider"],
    projectId: headers.get("x-cms-project-id") ?? undefined,
    dataset: headers.get("x-cms-dataset") ?? undefined,
    apiToken: headers.get("x-cms-token") ?? undefined,
    apiUrl: headers.get("x-cms-api-url") ?? undefined,
  };
}
