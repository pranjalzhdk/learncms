"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useContent, useCreateContent, useUpdateContent } from "@/hooks/use-content";
import { useUIStore } from "@/store/ui-store";

const AUTHORS = ["Sarah Chen", "Alex Rivera", "Jordan Lee"];
const CATEGORIES = ["Getting Started", "Architecture", "Tutorial", "Product", "News"];
const LOCALES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

export function ContentEditorPanel({ onAction }: { onAction?: (action: string) => void }) {
  const userRole = useUIStore((s) => s.userRole);
  const canEdit = userRole === "admin" || userRole === "editor";

  const { data: entries, isLoading } = useContent();
  const createMutation = useCreateContent();
  const updateMutation = useUpdateContent();

  const [entryId, setEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(AUTHORS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState("");
  const [locale, setLocale] = useState("en");
  const [readingTime, setReadingTime] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const active = entries?.find((e) => e.id === entryId) ?? entries?.[0];

  useEffect(() => {
    if (active && !entryId) setEntryId(active.id);
    if (active) {
      setTitle(active.title);
      setSlug(active.slug);
      setContent(active.content.replace(/<[^>]*>/g, ""));
      setAuthor(active.author);
      setCategory(active.category);
      setImage(active.image ?? "");
      setLocale(active.locale);
      setReadingTime(active.readingTime?.toString() ?? "");
      setStatus(active.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
    }
  }, [active, entryId]);

  const save = async (input: Record<string, unknown>, action?: string) => {
    if (!canEdit) return;
    if (active) {
      await updateMutation.mutateAsync({ id: active.id, input });
      if (action) onAction?.(action);
    }
  };

  if (isLoading) return <div className="flex items-center gap-2 text-neutral-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading entries...</div>;

  return (
    <div className="space-y-4">
      {!canEdit && (
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">Viewer role — editing disabled. Change role in the Roles tab.</p>
      )}

      <div className="flex items-center gap-2">
        <select
          value={entryId ?? ""}
          onChange={(e) => setEntryId(e.target.value)}
          className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2"
        >
          {entries?.map((e) => (
            <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
          ))}
          {!entries?.length && <option value="">No entries yet</option>}
        </select>
        {canEdit && (
          <button
            onClick={async () => {
              const res = await createMutation.mutateAsync({ title: "New Post", content: "<p>Start writing...</p>", status: "DRAFT" });
              setEntryId(res.data.id);
              onAction?.("create-title");
            }}
            className="text-xs px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 whitespace-nowrap"
          >
            + New Entry
          </button>
        )}
      </div>

      <div className="grid gap-3">
        <Field label="Title" value={title} onChange={setTitle} onSave={() => save({ title, slug: slug || title.toLowerCase().replace(/\s+/g, "-") }, "create-title")} disabled={!canEdit} />
        <Field label="Slug" value={slug} onChange={setSlug} onSave={() => save({ slug })} disabled={!canEdit} mono />
        <div>
          <label className="text-xs font-medium text-neutral-500">Author (reference)</label>
          <select value={author} disabled={!canEdit} onChange={(e) => { setAuthor(e.target.value); save({ author: e.target.value }, "set-author"); }} className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2">
            {AUTHORS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Category (taxonomy)</label>
          <select value={category} disabled={!canEdit} onChange={(e) => { setCategory(e.target.value); save({ category: e.target.value }, "set-category"); }} className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Hero Image URL" value={image} onChange={setImage} onSave={() => save({ image: image || null }, "add-image")} disabled={!canEdit} />
        <div>
          <label className="text-xs font-medium text-neutral-500">Body (rich text)</label>
          <textarea value={content} disabled={!canEdit} onChange={(e) => setContent(e.target.value)} onBlur={() => save({ content: `<p>${content}</p>` }, "add-content")} rows={4} className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Locale (localization)</label>
          <select value={locale} disabled={!canEdit} onChange={(e) => {
            const v = e.target.value;
            setLocale(v);
            save({ locale: v }, v !== "en" ? "switch-locale" : undefined);
          }} className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2">
            {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <Field label="Reading Time (SEO metadata)" value={readingTime} onChange={setReadingTime} onSave={() => save({ readingTime: readingTime ? Number(readingTime) : null }, "add-reading-time")} disabled={!canEdit} />
        <div>
          <label className="text-xs font-medium text-neutral-500">Status (publish workflow)</label>
          <div className="mt-1 flex gap-2">
            {(["DRAFT", "PUBLISHED"] as const).map((s) => (
              <button
                key={s}
                disabled={!canEdit}
                onClick={() => { setStatus(s); save({ status: s }, s === "PUBLISHED" ? "publish" : "save-draft"); }}
                className={`px-3 py-1.5 text-xs rounded-lg border ${status === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, onSave, disabled, mono }: {
  label: string; value: string; onChange: (v: string) => void; onSave: () => void; disabled?: boolean; mono?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} onBlur={onSave}
        className={`mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 ${mono ? "font-mono text-xs" : ""}`} />
    </div>
  );
}
