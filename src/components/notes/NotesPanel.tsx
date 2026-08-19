"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { NoteDTO } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { format } from "date-fns";

export function NotesPanel({
  projectId,
  notes,
  onChange,
}: {
  projectId: string;
  notes: NoteDTO[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NoteDTO | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);

  function startCreate() {
    setEditing(null);
    setTitle("");
    setContent("");
    setPreview(false);
    setOpen(true);
  }

  function startEdit(note: NoteDTO) {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
    setPreview(false);
    setOpen(true);
  }

  async function save() {
    const payload = { projectId, title, content };
    const res = await fetch(editing ? `/api/notes/${editing.id}` : "/api/notes", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    setOpen(false);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Notes</h3>
        <Button size="sm" onClick={startCreate}>
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No notes yet. Capture decisions in markdown.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <article
              key={note.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-[11px] text-[var(--muted)]">
                    Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--hover)]"
                    onClick={() => startEdit(note)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-400"
                    onClick={() => remove(note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-[var(--muted)]">
                <ReactMarkdown>{note.content || "_Empty note_"}</ReactMarkdown>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit note" : "New note"} className="max-w-2xl">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="mb-0">Content (Markdown)</Label>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPreview((p) => !p)}>
              {preview ? "Edit" : "Preview"}
            </Button>
          </div>
          {preview ? (
            <div className="min-h-[160px] rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{content || "_Nothing to preview_"}</ReactMarkdown>
            </div>
          ) : (
            <Textarea
              className="min-h-[180px] font-mono text-xs"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="## Heading&#10;- bullet"
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!title.trim()}>
              Save note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
