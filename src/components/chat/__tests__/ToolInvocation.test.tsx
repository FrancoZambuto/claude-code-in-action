import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation, getToolActionLabel } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// getToolActionLabel (pure helper)
// ---------------------------------------------------------------------------

test("getToolActionLabel maps str_replace_editor create", () => {
  expect(
    getToolActionLabel("str_replace_editor", {
      command: "create",
      path: "/App.jsx",
    })
  ).toEqual({ action: "Creating file", target: "App.jsx" });
});

test("getToolActionLabel maps str_replace_editor str_replace and insert to Editing", () => {
  expect(
    getToolActionLabel("str_replace_editor", {
      command: "str_replace",
      path: "/src/Card.jsx",
    })
  ).toEqual({ action: "Editing file", target: "Card.jsx" });

  expect(
    getToolActionLabel("str_replace_editor", {
      command: "insert",
      path: "/src/Card.jsx",
    })
  ).toEqual({ action: "Editing file", target: "Card.jsx" });
});

test("getToolActionLabel maps str_replace_editor view and undo_edit", () => {
  expect(
    getToolActionLabel("str_replace_editor", {
      command: "view",
      path: "/App.jsx",
    })
  ).toEqual({ action: "Viewing file", target: "App.jsx" });

  expect(
    getToolActionLabel("str_replace_editor", {
      command: "undo_edit",
      path: "/App.jsx",
    })
  ).toEqual({ action: "Reverting file", target: "App.jsx" });
});

test("getToolActionLabel maps file_manager rename with new_path", () => {
  expect(
    getToolActionLabel("file_manager", {
      command: "rename",
      path: "/a.jsx",
      new_path: "/b.jsx",
    })
  ).toEqual({ action: "Renaming file", target: "a.jsx → b.jsx" });
});

test("getToolActionLabel maps file_manager delete", () => {
  expect(
    getToolActionLabel("file_manager", {
      command: "delete",
      path: "/old.css",
    })
  ).toEqual({ action: "Deleting file", target: "old.css" });
});

test("getToolActionLabel strips directories from the path", () => {
  expect(
    getToolActionLabel("str_replace_editor", {
      command: "create",
      path: "/src/components/ui/Button.jsx",
    }).target
  ).toBe("Button.jsx");
});

test("getToolActionLabel defaults str_replace_editor with empty args to Editing file without target", () => {
  expect(getToolActionLabel("str_replace_editor", {})).toEqual({
    action: "Editing file",
    target: undefined,
  });
});

test("getToolActionLabel falls back for unknown tools", () => {
  expect(getToolActionLabel("some_unknown_tool", {})).toEqual({
    action: "Working",
    target: "some_unknown_tool",
  });
});

// ---------------------------------------------------------------------------
// ToolInvocation (rendering)
// ---------------------------------------------------------------------------

test("ToolInvocation renders a friendly label and file name for a create", () => {
  const { container } = render(
    <ToolInvocation
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );

  expect(screen.getByText("Creating file")).toBeDefined();
  expect(screen.getByText("App.jsx")).toBeDefined();
  // In-progress -> spinner is shown, no success dot
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocation shows the success indicator when the call has a result", () => {
  const { container } = render(
    <ToolInvocation
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/src/Card.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Editing file")).toBeDefined();
  expect(screen.getByText("Card.jsx")).toBeDefined();
  // Completed -> emerald dot, no spinner
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocation renders file_manager delete", () => {
  render(
    <ToolInvocation
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "delete", path: "/old.css" },
        state: "result",
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Deleting file")).toBeDefined();
  expect(screen.getByText("old.css")).toBeDefined();
});

test("ToolInvocation renders file_manager rename with both file names", () => {
  render(
    <ToolInvocation
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "rename", path: "/a.jsx", new_path: "/b.jsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Renaming file")).toBeDefined();
  expect(screen.getByText("a.jsx → b.jsx")).toBeDefined();
});

test("ToolInvocation does not crash with empty args and shows a default label", () => {
  render(
    <ToolInvocation
      toolInvocation={{
        toolName: "str_replace_editor",
        args: {},
        state: "partial-call",
      }}
    />
  );

  expect(screen.getByText("Editing file")).toBeDefined();
});
