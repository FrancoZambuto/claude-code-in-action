"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationProps {
  toolInvocation: {
    toolName: string;
    args?: Record<string, any>;
    state: string;
    result?: unknown;
  };
}

interface ToolActionLabel {
  action: string;
  target?: string;
}

function basename(path?: string): string | undefined {
  if (!path) return undefined;
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] || path;
}

export function getToolActionLabel(
  toolName: string,
  args?: Record<string, any>
): ToolActionLabel {
  const file = basename(args?.path);

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":
        return { action: "Creating file", target: file };
      case "str_replace":
      case "insert":
        return { action: "Editing file", target: file };
      case "view":
        return { action: "Viewing file", target: file };
      case "undo_edit":
        return { action: "Reverting file", target: file };
      default:
        return { action: "Editing file", target: file };
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "rename": {
        const to = basename(args?.new_path);
        return {
          action: "Renaming file",
          target: file && to ? `${file} → ${to}` : file ?? to,
        };
      }
      case "delete":
        return { action: "Deleting file", target: file };
      default:
        return { action: "Updating file", target: file };
    }
  }

  return { action: "Working", target: file ?? toolName };
}

export function ToolInvocation({ toolInvocation }: ToolInvocationProps) {
  const { action, target } = getToolActionLabel(
    toolInvocation.toolName,
    toolInvocation.args
  );
  const isComplete =
    toolInvocation.state === "result" && !!toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700 font-medium">{action}</span>
      {target && (
        <span className="text-neutral-900 font-mono">{target}</span>
      )}
    </div>
  );
}
