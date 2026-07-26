"use client";

import { Calendar, ChevronDown, Gem, LayoutGrid, List, MoreHorizontal, Puzzle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";
import FormCardContextMenu from "@/components/FormCardContextMenu";
import Header from "@/components/Header";
import { useToast } from "@/components/ToastProvider";
import DropdownMenu, { MenuItem } from "@/components/ui/DropdownMenu";
import { createForm, deleteForm, duplicateForm, fetchForms, updateForm } from "@/lib/api";
import { Form } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Form | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const workspaceMenuRef = useRef<HTMLButtonElement>(null);

  const loadForms = async () => {
    try {
      setLoading(true);
      setForms(await fetchForms());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleCreateForm = async () => {
    try {
      const form = await createForm("New form");
      router.push(`/builder/${form.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create a form.");
    }
  };

  const handleDuplicate = async (formId: string) => {
    try {
      await duplicateForm(formId);
      toast.success("Form duplicated as a draft");
      loadForms();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not duplicate that form.");
    }
  };

  const handleDelete = async (formId: string) => {
    const target = forms.find((form) => form.id === formId);
    const warning = target?.response_count
      ? `Delete “${target.title}” and its ${target.response_count} response(s)? This cannot be undone.`
      : "Delete this form? This cannot be undone.";
    if (!confirm(warning)) return;

    try {
      await deleteForm(formId);
      toast.success("Form deleted");
      loadForms();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete that form.");
    }
  };

  const handleCopyLink = (shareId: string) => {
    const form = forms.find((candidate) => candidate.share_id === shareId);
    navigator.clipboard.writeText(`${window.location.origin}/f/${shareId}`);
    if (form && form.status !== "published") {
      toast.info("Link copied — publish the form before sharing it.");
    } else {
      toast.success("Shareable link copied to clipboard");
    }
  };

  const handleSaveRename = async () => {
    if (!renameTarget || !newTitle.trim()) return;
    try {
      await updateForm(renameTarget.id, { title: newTitle.trim() });
      toast.success("Form renamed");
      setRenameTarget(null);
      loadForms();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not rename that form.");
    }
  };

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalResponses = forms.reduce((sum, form) => sum + form.response_count, 0);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header activeTab="Forms" />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateForm={handleCreateForm}
          formCount={forms.length}
          responseCount={totalResponses}
        />

        <main className="flex-1 overflow-y-auto px-10 py-7">
          {/* Workspace title row */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-[30px] leading-none text-ink">My workspace</h1>

              <div>
                <button
                  ref={workspaceMenuRef}
                  onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                  aria-label="Workspace options"
                  aria-haspopup="menu"
                  aria-expanded={workspaceMenuOpen}
                  className="rounded-md p-1 text-muted transition-colors hover:bg-panel hover:text-ink"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                <DropdownMenu
                  anchorRef={workspaceMenuRef}
                  open={workspaceMenuOpen}
                  onClose={() => setWorkspaceMenuOpen(false)}
                  placement="bottom-start"
                  width={180}
                >
                  <MenuItem
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      toast.info("A single default workspace ships in this build.");
                    }}
                  >
                    Rename
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      toast.info("Team workspaces are not part of this build.");
                    }}
                  >
                    Leave
                  </MenuItem>
                  <MenuItem
                    danger
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      toast.info("The default workspace cannot be deleted.");
                    }}
                  >
                    Delete
                  </MenuItem>
                </DropdownMenu>
              </div>

              <button className="flex items-center gap-2 text-[15px] text-ink transition-opacity hover:opacity-70">
                <UserPlus className="h-[18px] w-[18px]" />
                <span>Invite</span>
              </button>
              <Gem className="h-[18px] w-[18px] text-brand-green" />
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-hair px-3 py-2 text-[14px] text-ink transition-colors hover:bg-panel">
                <Calendar className="h-4 w-4" />
                <span>Date created</span>
                <ChevronDown className="h-4 w-4 text-muted" />
              </button>

              <div className="flex items-center rounded-lg border border-hair p-0.5">
                {[
                  { id: "list" as const, icon: List, label: "List" },
                  { id: "grid" as const, icon: LayoutGrid, label: "Grid" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[14px] transition-colors ${
                      view === id ? "bg-panel text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column headers sit above a single hairline, right-aligned */}
          <div className="flex items-center border-b border-hair pb-2.5 text-[15px] text-muted">
            <span className="flex-1" />
            <span className="w-[110px] text-center">Responses</span>
            <span className="w-[110px] text-center">Completed</span>
            <span className="w-[130px]">Updated</span>
            <span className="w-[120px]">Integrations</span>
            <span className="w-[52px]" />
          </div>

          {loading ? (
            <p className="py-14 text-center text-[15px] text-muted">Loading forms...</p>
          ) : filteredForms.length === 0 ? (
            <div className="space-y-4 py-20 text-center">
              <p className="text-[17px] text-muted">No forms in this workspace yet.</p>
              <button
                onClick={handleCreateForm}
                className="rounded-lg bg-chrome px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-chrome-hover active:bg-chrome-pressed active:scale-[0.99]"
              >
                Create your first form
              </button>
            </div>
          ) : view === "list" ? (
            <div className="mt-4 space-y-2">
              {filteredForms.map((form) => (
                <FormRow
                  key={form.id}
                  form={form}
                  isMenuOpen={activeMenuId === form.id}
                  onToggleMenu={() => setActiveMenuId(activeMenuId === form.id ? null : form.id)}
                  onCloseMenu={() => setActiveMenuId(null)}
                  onOpen={() => router.push(`/builder/${form.id}`)}
                  onOpenTab={(formId, tab) => router.push(`/builder/${formId}?tab=${tab}`)}
                  onResults={() => router.push(`/forms/${form.id}/results`)}
                  onRename={(target) => {
                    setRenameTarget(target);
                    setNewTitle(target.title);
                  }}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onCopyLink={handleCopyLink}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filteredForms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => router.push(`/builder/${form.id}`)}
                  className="overflow-hidden rounded-xl border border-hair text-left transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                >
                  <span className="block h-28 bg-gradient-to-br from-[#c79ae4] to-[#9333ea]" />
                  <span className="block px-4 py-3">
                    <span className="block truncate text-[15px] text-ink">{form.title}</span>
                    <span className="mt-1 block text-[13px] text-muted">
                      {form.response_count} response{form.response_count === 1 ? "" : "s"} ·{" "}
                      {form.status}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="animate-fade-in w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-2xl">
            <h3 className="text-[22px] text-ink">Rename form</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSaveRename()}
              autoFocus
              className="w-full rounded-lg border border-hair px-3.5 py-2.5 text-[15px] text-ink focus:border-ink focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="rounded-lg px-4 py-2.5 text-[15px] text-muted transition-colors hover:bg-panel"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="rounded-lg bg-chrome px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-chrome-hover active:bg-chrome-pressed active:scale-[0.99]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormRowProps {
  form: Form;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onOpen: () => void;
  onOpenTab: (formId: string, tab: "Content" | "Workflow" | "Connect") => void;
  onResults: () => void;
  onRename: (form: Form) => void;
  onDuplicate: (formId: string) => void;
  onDelete: (formId: string) => void;
  onCopyLink: (shareId: string) => void;
}

/** A bordered row card — Typeform renders each form as its own outlined box. */
function FormRow({
  form,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onOpen,
  onOpenTab,
  onResults,
  onRename,
  onDuplicate,
  onDelete,
  onCopyLink,
}: FormRowProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isPublished = form.status === "published";

  return (
    <div className="relative flex items-center rounded-xl border border-hair px-4 py-3 transition-colors hover:border-[#d4d4d8]">
      <button onClick={onOpen} className="flex flex-1 items-center gap-3.5 overflow-hidden text-left">
        <span className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-[#c79ae4] to-[#9333ea]" />
        <span className="truncate text-[15px] font-medium text-ink">{form.title}</span>
        {!isPublished && (
          <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 text-[12px] text-muted">
            Draft
          </span>
        )}
      </button>

      <button onClick={onResults} className="w-[110px] text-center text-[15px] text-ink hover:underline">
        {form.response_count || <span className="text-faint">–</span>}
      </button>

      <span className="w-[110px] text-center text-[15px] text-ink">
        {form.response_count || <span className="text-faint">–</span>}
      </span>

      <span className="w-[130px] text-[15px] text-muted">
        {new Date(form.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>

      <span className="w-[120px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-hair text-muted">
          <Puzzle className="h-4 w-4" />
        </span>
      </span>

      <div className="w-[52px] text-right">
        <button
          ref={menuButtonRef}
          onClick={(event) => {
            event.stopPropagation();
            onToggleMenu();
          }}
          aria-label="Form options"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        <FormCardContextMenu
          form={form}
          anchorRef={menuButtonRef}
          isOpen={isMenuOpen}
          onClose={onCloseMenu}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onCopyLink={onCopyLink}
          onOpenTab={onOpenTab}
        />
      </div>
    </div>
  );
}
