"use client";

import type { ContentEntry, WebsiteFeature } from "@/modules/cms/types";

interface XRayOverlayProps {
  entry: ContentEntry | null;
  field: string;
  jsonPath: string;
  component: string;
  value: string;
}

export function XRayOverlay({ field, jsonPath, component, value }: XRayOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute inset-0 bg-blue-950/10 backdrop-blur-[1px]" />
      <div className="absolute top-2 left-2 right-2 flex gap-2 text-[10px] font-mono">
        <div className="flex-1 bg-violet-600/90 text-white px-2 py-1.5 rounded-lg">
          <span className="opacity-70">CMS · </span>{field}
          <p className="truncate opacity-90">{value}</p>
        </div>
        <div className="text-white/60 self-center">→</div>
        <div className="flex-1 bg-emerald-600/90 text-white px-2 py-1.5 rounded-lg">
          <span className="opacity-70">JSON · </span>{jsonPath}
        </div>
        <div className="text-white/60 self-center">→</div>
        <div className="flex-1 bg-blue-600/90 text-white px-2 py-1.5 rounded-lg">
          <span className="opacity-70">Component · </span>{component}
        </div>
      </div>
    </div>
  );
}

export function hasFeature(features: WebsiteFeature[], f: WebsiteFeature) {
  return features.includes(f);
}
