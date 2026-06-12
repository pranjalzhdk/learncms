"use client";

import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { actionMatchesStep } from "@/lib/lesson-actions";

const ROLES = [
  { id: "admin" as const, name: "Admin", desc: "Full access — create, edit, publish, delete, manage schema", permissions: ["create", "edit", "publish", "delete", "schema", "users"] },
  { id: "editor" as const, name: "Editor", desc: "Create and edit content, publish entries", permissions: ["create", "edit", "publish"] },
  { id: "viewer" as const, name: "Viewer", desc: "Read-only access — cannot modify content", permissions: ["read"] },
];

export function RolesPanel({
  onAction,
  expectedAction,
}: {
  onAction?: (action: string) => void;
  expectedAction?: string;
}) {
  const userRole = useUIStore((s) => s.userRole);
  const setUserRole = useUIStore((s) => s.setUserRole);

  const fire = (action: string) => {
    if (expectedAction && !actionMatchesStep(expectedAction, action)) return;
    onAction?.(action);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        CMS platforms enforce access control through roles. Each role grants a specific set of permissions over content and settings.
      </p>

      <div className="space-y-2">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => {
              setUserRole(role.id);
              if (expectedAction === "explore-roles") {
                fire("explore-roles");
              }
            }}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-colors",
              userRole === role.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-900">{role.name}</p>
              {userRole === role.id && <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full">Active</span>}
            </div>
            <p className="text-xs text-neutral-500 mt-1">{role.desc}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {role.permissions.map((p) => (
                <span key={p} className="text-[10px] px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-neutral-600">{p}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {userRole === "viewer" && expectedAction === "change-role" && (
        <p className="text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg">
          Now switch to the Editor tab and try editing a field — that completes this step.
        </p>
      )}
    </div>
  );
}
