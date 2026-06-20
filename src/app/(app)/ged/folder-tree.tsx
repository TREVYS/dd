"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";

export type FolderNode = {
  id: string;
  name: string;
  level: number;
  children: FolderNode[];
};

function FolderItem({
  node,
  clientId,
  selectedFolderId,
  defaultOpen,
}: {
  node: FolderNode;
  clientId: string;
  selectedFolderId: string | null;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isSelected = node.id === selectedFolderId;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
          isSelected ? "bg-brand/10 text-brand font-medium" : "text-gray-600 hover:bg-gray-50"
        }`}
        style={{ paddingLeft: `${(node.level - 1) * 14 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="text-gray-400 shrink-0">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <span className="w-[13px] shrink-0" />
        )}
        <Link
          href={`/ged?client=${clientId}&folder=${node.id}`}
          className="flex items-center gap-1.5 flex-1 truncate"
        >
          {isSelected ? <FolderOpen size={14} className="shrink-0" /> : <Folder size={14} className="shrink-0" />}
          <span className="truncate">{node.name}</span>
        </Link>
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <FolderItem
              key={child.id}
              node={child}
              clientId={clientId}
              selectedFolderId={selectedFolderId}
              defaultOpen={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({
  tree,
  clientId,
  selectedFolderId,
}: {
  tree: FolderNode[];
  clientId: string;
  selectedFolderId: string | null;
}) {
  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <FolderItem
          key={node.id}
          node={node}
          clientId={clientId}
          selectedFolderId={selectedFolderId}
          defaultOpen={node.level === 1}
        />
      ))}
    </div>
  );
}
