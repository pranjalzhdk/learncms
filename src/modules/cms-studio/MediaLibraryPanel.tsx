"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useMedia, useCreateMedia } from "@/hooks/use-media";
import { useUIStore } from "@/store/ui-store";

const SAMPLE_IMAGES = [
  { filename: "hero.jpg", url: "https://images.unsplash.com/photo-1499750310107-5fef28fd666f?w=800&h=400&fit=crop" },
  { filename: "coding.jpg", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" },
  { filename: "analytics.jpg", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" },
];

export function MediaLibraryPanel({ onAction }: { onAction?: (action: string) => void }) {
  const { data: assets, isLoading } = useMedia();
  const createMedia = useCreateMedia();
  const [url, setUrl] = useState("");
  const userRole = useUIStore((s) => s.userRole);
  const canEdit = userRole === "admin" || userRole === "editor";

  const addAsset = async (filename: string, assetUrl: string) => {
    await createMedia.mutateAsync({ filename, url: assetUrl, mimeType: "image/jpeg", size: 200000 });
    onAction?.("open-media");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        The media library stores assets separately from content entries. Files are referenced by URL in blog posts, products, and pages.
      </p>

      {canEdit && (
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste image URL..." className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2" />
          <button
            onClick={() => url && addAsset("upload.jpg", url)}
            disabled={createMedia.isPending || !url}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
        </div>
      )}

      <div>
        <p className="text-xs text-neutral-400 mb-2">Quick add samples:</p>
        <div className="flex gap-2">
          {SAMPLE_IMAGES.map((img) => (
            <button key={img.filename} onClick={() => canEdit && addAsset(img.filename, img.url)} className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-400">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-neutral-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading library...</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {assets?.map((a) => (
            <div key={a.id} className="rounded-lg overflow-hidden border border-neutral-200">
              <img src={a.url} alt={a.alt ?? ""} className="w-full h-20 object-cover" />
              <p className="text-[10px] px-2 py-1 truncate text-neutral-500">{a.filename}</p>
            </div>
          ))}
          {!assets?.length && <p className="col-span-3 text-xs text-neutral-400 text-center py-4">No media assets yet</p>}
        </div>
      )}
    </div>
  );
}
