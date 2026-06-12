"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FIELD_TYPES } from "@/lib/constants/content-types";
import { useUIStore } from "@/store/ui-store";

export function SchemaBuilderPanel({ onAction }: { onAction?: (action: string) => void }) {
  const schemaFields = useUIStore((s) => s.schemaFields);
  const addField = useUIStore((s) => s.addSchemaField);
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const userRole = useUIStore((s) => s.userRole);
  const canEdit = userRole === "admin";

  const handleAdd = () => {
    if (!name.trim() || !canEdit) return;
    addField({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      fieldType,
      contentType: "blog-posts",
    });
    onAction?.("open-modeling");
    onAction?.("add-field");
    setName("");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        Content modeling lets you extend schemas without database migrations. New fields automatically appear in the editor, API, and frontend.
      </p>

      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
        <p className="text-xs font-medium text-neutral-700 mb-2">Blog Posts — current fields</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {["title", "slug", "author", "image", "content", "category", "status", "locale", "readingTime"].map((f) => (
            <span key={f} className="text-xs px-2 py-1 bg-white border border-neutral-200 rounded font-mono">{f}</span>
          ))}
          {schemaFields.map((f) => (
            <span key={f.id} className="text-xs px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded font-mono">{f.slug} ✨</span>
          ))}
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Field name (e.g. Reading Time)" className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2" />
            <select value={fieldType} onChange={(e) => setFieldType(e.target.value)} className="text-sm border border-neutral-200 rounded-lg px-2">
              {FIELD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        )}
        {!canEdit && <p className="text-xs text-amber-600">Admin role required to modify schemas.</p>}
      </div>
    </div>
  );
}
