"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, Plus } from "lucide-react";
import { useContent, useCreateContent, useUpdateContent } from "@/hooks/use-content";
import { useUIStore } from "@/store/ui-store";
import { actionMatchesStep } from "@/lib/lesson-actions";
import type { ContentEntry } from "@/modules/cms/types";

const AUTHORS = ["Sarah Chen", "Alex Rivera", "Jordan Lee"];
const CATEGORIES = ["Getting Started", "Architecture", "Tutorial", "Product", "News"];
const LOCALES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

function entryToForm(entry: ContentEntry) {
  return {
    title: entry.title,
    slug: entry.slug,
    content: entry.content.replace(/<[^>]*>/g, ""),
    author: entry.author,
    category: entry.category,
    image: entry.image ?? "",
    locale: entry.locale,
    readingTime: entry.readingTime?.toString() ?? "",
    status: (entry.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT") as "DRAFT" | "PUBLISHED",
  };
}

export function ContentEditorPanel({
  onAction,
  expectedAction,
}: {
  onAction?: (action: string) => void;
  expectedAction?: string;
}) {
  const userRole = useUIStore((s) => s.userRole);
  const canEdit = userRole === "admin" || userRole === "editor";

  const { data: entries, isLoading } = useContent();
  const createMutation = useCreateContent();
  const updateMutation = useUpdateContent();

  const [entryId, setEntryId] = useState<string | null>(null);
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(AUTHORS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState("");
  const [locale, setLocale] = useState("en");
  const [readingTime, setReadingTime] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadEntry = useCallback((entry: ContentEntry) => {
    const f = entryToForm(entry);
    setTitle(f.title);
    setSlug(f.slug);
    setContent(f.content);
    setAuthor(f.author);
    setCategory(f.category);
    setImage(f.image);
    setLocale(f.locale);
    setReadingTime(f.readingTime);
    setStatus(f.status);
    setIsComposingNew(false);
  }, []);

  // Pick first entry once when data loads — do not reset while user types
  useEffect(() => {
    if (entries?.length && !entryId && !isComposingNew) {
      setEntryId(entries[0].id);
    }
  }, [entries, entryId, isComposingNew]);

  // Load form only when switching entries — not on every refetch
  useEffect(() => {
    if (isComposingNew || !entryId) return;
    const entry = entries?.find((e) => e.id === entryId);
    if (entry) loadEntry(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, isComposingNew]);

  const fire = (action: string) => {
    if (expectedAction && !actionMatchesStep(expectedAction, action)) return;
    onAction?.(action);
  };

  const handleSelectEntry = (id: string) => {
    if (!id) return;
    setEntryId(id);
    setIsComposingNew(false);
    setSaveMessage(null);
  };

  const startNewEntry = () => {
    setIsComposingNew(true);
    setEntryId(null);
    setSaveMessage(null);
    setTitle("");
    setSlug("");
    setContent("");
    setAuthor(AUTHORS[0]);
    setCategory(CATEGORIES[0]);
    setImage("");
    setLocale("en");
    setReadingTime("");
    setStatus("DRAFT");
  };

  const handleCreate = async () => {
    if (!canEdit || !title.trim()) return;
    setSaveMessage(null);
    try {
      const res = await createMutation.mutateAsync({
        title: title.trim(),
        slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, "-"),
        content: content ? `<p>${content}</p>` : "<p>Start writing...</p>",
        author,
        category,
        image: image || null,
        locale,
        readingTime: readingTime ? Number(readingTime) : null,
        status,
      });
      setEntryId(res.data.id);
      setIsComposingNew(false);
      setSaveMessage("Entry created");
      fire("create-title");
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Failed to create");
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      if (expectedAction === "change-role") fire("change-role");
      return;
    }
    const entry = entries?.find((e) => e.id === entryId);
    if (!entry) return;

    setSaveMessage(null);
    try {
      await updateMutation.mutateAsync({
        id: entry.id,
        input: {
          title: title.trim(),
          slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, "-"),
          content: `<p>${content}</p>`,
          author,
          category,
          image: image || null,
          locale,
          readingTime: readingTime ? Number(readingTime) : null,
        },
      });
      setSaveMessage("Saved");

      const changes: [string, boolean][] = [
        ["edit-title", title.trim() !== entry.title],
        ["create-title", false],
        ["set-author", author !== entry.author],
        ["set-category", category !== entry.category],
        ["add-image", image !== (entry.image ?? "")],
        ["switch-locale", locale !== entry.locale && locale !== "en"],
        ["add-reading-time", readingTime !== (entry.readingTime?.toString() ?? "")],
      ];
      for (const [action, changed] of changes) {
        if (changed && (!expectedAction || actionMatchesStep(expectedAction, action))) {
          fire(action);
          break;
        }
      }
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const handleStatusChange = async (newStatus: "DRAFT" | "PUBLISHED") => {
    if (!canEdit) {
      fire("change-role");
      return;
    }
    const entry = entries?.find((e) => e.id === entryId);
    if (!entry) return;

    setStatus(newStatus);
    setSaveMessage(null);
    try {
      await updateMutation.mutateAsync({ id: entry.id, input: { status: newStatus } });
      setSaveMessage(newStatus === "PUBLISHED" ? "Published" : "Saved as draft");
      fire(newStatus === "PUBLISHED" ? "publish" : "save-draft");
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-neutral-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading entries...
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      {!canEdit && (
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
          Viewer role — editing disabled. Try clicking a field to see access control in action.
        </p>
      )}

      <div className="flex items-center gap-2">
        {!isComposingNew && (
          <select
            value={entryId ?? ""}
            onChange={(e) => handleSelectEntry(e.target.value)}
            className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2"
          >
            {entries?.map((e) => (
              <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
            ))}
            {!entries?.length && <option value="">No entries yet</option>}
          </select>
        )}
        {isComposingNew && (
          <p className="flex-1 text-sm text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
            New entry — fill in the title, then click Create in CMS
          </p>
        )}
        {canEdit && (
          <button
            onClick={startNewEntry}
            disabled={isComposingNew}
            className="flex items-center gap-1 text-xs px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> New Entry
          </button>
        )}
      </div>

      <div className="grid gap-3">
        <Field label="Title" value={title} onChange={setTitle} disabled={!canEdit} onBlockedEdit={() => fire("change-role")} />
        <Field label="Slug" value={slug} onChange={setSlug} disabled={!canEdit} onBlockedEdit={() => fire("change-role")} mono />
        <div>
          <label className="text-xs font-medium text-neutral-500">Author (reference)</label>
          <select
            value={author}
            disabled={!canEdit}
            onChange={(e) => setAuthor(e.target.value)}
            onMouseDown={() => !canEdit && fire("change-role")}
            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2"
          >
            {AUTHORS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Category (taxonomy)</label>
          <select
            value={category}
            disabled={!canEdit}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Hero Image URL" value={image} onChange={setImage} disabled={!canEdit} onBlockedEdit={() => fire("change-role")} />
        <div>
          <label className="text-xs font-medium text-neutral-500">Body (rich text)</label>
          <textarea
            value={content}
            disabled={!canEdit}
            onChange={(e) => setContent(e.target.value)}
            onMouseDown={() => !canEdit && fire("change-role")}
            rows={4}
            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Locale (localization)</label>
          <select
            value={locale}
            disabled={!canEdit}
            onChange={(e) => setLocale(e.target.value)}
            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2"
          >
            {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <Field label="Reading Time (SEO metadata)" value={readingTime} onChange={setReadingTime} disabled={!canEdit} onBlockedEdit={() => fire("change-role")} />

        <div>
          <label className="text-xs font-medium text-neutral-500">Status (publish workflow)</label>
          <div className="mt-1 flex gap-2">
            {(["DRAFT", "PUBLISHED"] as const).map((s) => (
              <button
                key={s}
                disabled={!canEdit || isComposingNew}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 text-xs rounded-lg border ${status === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
          {isComposingNew ? (
            <button
              onClick={handleCreate}
              disabled={isPending || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create in CMS
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isPending || !entryId}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save changes
            </button>
          )}
          {saveMessage && (
            <span className={`text-xs ${saveMessage.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>
              {saveMessage}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, disabled, mono, onBlockedEdit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  mono?: boolean;
  onBlockedEdit?: () => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={() => disabled && onBlockedEdit?.()}
        onFocus={() => disabled && onBlockedEdit?.()}
        className={`mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 ${mono ? "font-mono text-xs" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
