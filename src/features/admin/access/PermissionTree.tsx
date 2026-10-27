"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryIds, type CategoryId } from "@/types/domain";
import { Checkbox } from "@/components/admin/controls";
import { adminButton } from "@/components/admin/button";
import { categoryLabels } from "@/lib/admin/labels";
import { formatNumber } from "@/lib/admin/format";
import {
  actionLabels,
  allPermissions,
  isJudgePermission,
  managerPermissions,
  normalizePermissions,
  permissionGroups,
  type Permission,
  type PermissionResource,
} from "@/lib/admin/permissions";
import { type JudgeScope } from "@/lib/admin/types";

export interface AccessValue {
  permissions: Permission[];
  scope: JudgeScope;
}

export interface Topic {
  id: string;
  title: string;
}

type Leaf =
  | { type: "permission"; permission: Permission }
  | { type: "category"; id: CategoryId }
  | { type: "topic"; id: string };

interface TreeNode {
  key: string;
  label: string;
  leaves: Leaf[];
  children?: TreeNode[];
}

const indents = ["ps-2", "ps-7", "ps-12", "ps-17"];

const leafKey = (leaf: Leaf) =>
  leaf.type === "permission" ? leaf.permission : `${leaf.type}:${leaf.id}`;

function resourceNode(resource: PermissionResource, topics: Topic[]): TreeNode {
  const children = resource.actions.map((action): TreeNode => {
    const permission = `${resource.id}.${action}` as Permission;
    const scoped =
      action === "judge" && resource.id === "art"
        ? categoryIds.map((id): TreeNode => ({
            key: `category:${id}`,
            label: categoryLabels[id],
            leaves: [{ type: "category", id }],
          }))
        : action === "judge" && resource.id === "science"
          ? topics.map((topic): TreeNode => ({
              key: `topic:${topic.id}`,
              label: topic.title,
              leaves: [{ type: "topic", id: topic.id }],
            }))
          : undefined;
    return {
      key: permission,
      label: actionLabels[action],
      leaves: scoped ? scoped.flatMap((node) => node.leaves) : [{ type: "permission", permission }],
      children: scoped,
    };
  });
  return {
    key: resource.id,
    label: resource.label,
    leaves: children.flatMap((child) => child.leaves),
    children: children.length > 1 ? children : undefined,
  };
}

function buildTree(topics: Topic[]): TreeNode[] {
  return permissionGroups.map((group) => {
    const resources = group.resources.map((resource) => resourceNode(resource, topics));
    return {
      key: group.id,
      label: group.title,
      leaves: resources.flatMap((resource) => resource.leaves),
      children: resources,
    };
  });
}

function toKeys(value: AccessValue, topics: Topic[]) {
  const keys = new Set<string>(
    value.permissions.filter((permission) => !isJudgePermission(permission)),
  );
  if (value.permissions.includes("art.judge")) {
    const categories = value.scope.categories.length ? value.scope.categories : categoryIds;
    for (const id of categories) keys.add(`category:${id}`);
  }
  if (value.permissions.includes("science.judge")) {
    const ids = value.scope.topics.length ? value.scope.topics : topics.map((topic) => topic.id);
    for (const id of ids) keys.add(`topic:${id}`);
  }
  return keys;
}

function fromKeys(keys: Set<string>, topics: Topic[]): AccessValue {
  const categories = categoryIds.filter((id) => keys.has(`category:${id}`));
  const picked = topics.filter((topic) => keys.has(`topic:${topic.id}`)).map((topic) => topic.id);
  const permissions = allPermissions.filter((permission) => keys.has(permission));
  if (categories.length) permissions.push("art.judge");
  if (picked.length) permissions.push("science.judge");
  return {
    permissions: normalizePermissions(permissions),
    scope: {
      categories: categories.length === categoryIds.length ? [] : categories,
      topics: picked.length === topics.length ? [] : picked,
    },
  };
}

function withoutResource(keys: Set<string>, resource: string, topics: Topic[]) {
  const next = new Set(keys);
  for (const key of keys) if (key.startsWith(`${resource}.`)) next.delete(key);
  if (resource === "art") for (const id of categoryIds) next.delete(`category:${id}`);
  if (resource === "science") for (const topic of topics) next.delete(`topic:${topic.id}`);
  return next;
}

interface PermissionTreeProps {
  value: AccessValue;
  onChange: (value: AccessValue) => void;
  topics: Topic[];
  disabled?: boolean;
}

export function PermissionTree({ value, onChange, topics, disabled }: PermissionTreeProps) {
  const [tree] = useState(() => buildTree(topics));
  const [open, setOpen] = useState<Set<string>>(() => new Set(tree.map((group) => group.key)));
  const keys = toKeys(value, topics);

  function toggle(node: TreeNode, checked: boolean) {
    let next = new Set(keys);
    for (const leaf of node.leaves) {
      if (checked) next.add(leafKey(leaf));
      else next.delete(leafKey(leaf));
    }
    if (!checked && node.key.endsWith(".view"))
      next = withoutResource(next, node.key.split(".")[0]!, topics);
    onChange(fromKeys(next, topics));
  }

  function preset(permissions: readonly Permission[]) {
    onChange({ permissions: [...permissions], scope: { categories: [], topics: [] } });
  }

  function expand(key: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function renderNode(node: TreeNode, depth: number) {
    const total = node.leaves.length;
    const count = node.leaves.filter((leaf) => keys.has(leafKey(leaf))).length;
    const state = count === 0 ? false : count === total ? true : "indeterminate";
    const expanded = open.has(node.key);
    return (
      <li key={node.key}>
        <div
          className={cn(
            "flex min-h-10 items-center gap-2 rounded-md pe-2 transition-colors hover:bg-green-900/4",
            indents[depth],
            depth === 0 && "bg-canvas/70",
          )}
        >
          {node.children ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? `بستن ${node.label}` : `باز کردن ${node.label}`}
              onClick={() => expand(node.key)}
              className="flex size-6 shrink-0 items-center justify-center rounded-sm text-ink-muted hover:bg-green-900/6"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-150",
                  !expanded && "ltr:-rotate-90 rtl:rotate-90",
                )}
                aria-hidden
              />
            </button>
          ) : (
            <span className="size-6 shrink-0" aria-hidden />
          )}
          <Checkbox
            checked={state}
            disabled={disabled}
            onCheckedChange={(checked) => toggle(node, checked === true)}
            label={
              <span className={cn(depth === 0 ? "font-bold" : depth === 1 && "font-medium")}>
                {node.label}
              </span>
            }
            className="flex-1 py-2"
          />
          {node.children && count > 0 && (
            <span className="text-2xs text-ink-muted tabular-nums">
              {count === total ? "همه" : `${formatNumber(count)} از ${formatNumber(total)}`}
            </span>
          )}
        </div>
        {node.children && expanded && (
          <ul>{node.children.map((child) => renderNode(child, depth + 1))}</ul>
        )}
      </li>
    );
  }

  return (
    <div className="rounded-btn-sm border border-line">
      {!disabled && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="me-1 text-2xs text-ink-muted">انتخاب سریع:</span>
          <button
            type="button"
            onClick={() => preset(managerPermissions)}
            className={adminButton({ variant: "subtle", size: "xs" })}
          >
            مدیر کل
          </button>
          <button
            type="button"
            onClick={() =>
              preset(allPermissions.filter((permission) => permission.endsWith(".view")))
            }
            className={adminButton({ variant: "subtle", size: "xs" })}
          >
            فقط مشاهده
          </button>
          <button
            type="button"
            onClick={() => preset([])}
            className={adminButton({ variant: "ghost", size: "xs" })}
          >
            پاک کردن
          </button>
        </div>
      )}
      <ul aria-label="دسترسی‌ها" className="flex flex-col gap-0.5 p-1.5">
        {tree.map((group) => renderNode(group, 0))}
      </ul>
    </div>
  );
}
