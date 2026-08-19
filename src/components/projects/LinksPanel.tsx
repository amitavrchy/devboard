"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import type { LinkDTO } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function LinksPanel({
  projectId,
  links,
  onChange,
}: {
  projectId: string;
  links: LinkDTO[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  async function addLink() {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, label, url }),
    });
    if (!res.ok) return;
    setOpen(false);
    setLabel("");
    setUrl("");
    onChange();
  }

  async function remove(id: string) {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Quick links</h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add link
        </Button>
      </div>
      {links.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Add repo, live app, Render, Netlify, or docs links.
        </p>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 hover:text-indigo-300"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium">{link.label}</span>
              </a>
              <button
                className="text-[var(--muted)] hover:text-rose-400"
                onClick={() => remove(link.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add quick link">
        <div className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Netlify Dashboard"
            />
          </div>
          <div>
            <Label>URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addLink} disabled={!url.trim()}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
