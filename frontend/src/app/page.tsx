"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import DashboardSidebar from "@/components/DashboardSidebar";
import FormCardContextMenu from "@/components/FormCardContextMenu";
import { Form } from "@/types";
import { fetchForms, createForm, updateForm, duplicateForm, deleteForm } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { MoreHorizontal, Calendar, LayoutList, LayoutGrid, UserPlus, BarChart2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Rename Modal State
  const [renameModalForm, setRenameModalForm] = useState<Form | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await fetchForms();
      setForms(data);
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
      const newForm = await createForm("New form");
      router.push(`/builder/${newForm.id}`);
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
    if (!renameModalForm || !newTitle.trim()) return;
    try {
      await updateForm(renameModalForm.id, { title: newTitle.trim() });
      toast.success("Form renamed");
      setRenameModalForm(null);
      loadForms();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not rename that form.");
    }
  };

  const filteredForms = forms.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header activeTab="Forms" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Dashboard Sidebar */}
        <DashboardSidebar
          onCreateForm={handleCreateForm}
          formCount={forms.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Workspace Title & Actions Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">My workspace</h1>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 bg-white px-2.5 py-1 rounded-md shadow-2xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-1.5 text-xs text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-2xs hover:bg-gray-50">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date created</span>
              </button>

              <div className="flex items-center border border-gray-200 bg-white rounded-lg p-0.5 shadow-2xs">
                <button className="p-1 rounded bg-gray-100 text-gray-800">
                  <LayoutList className="w-4 h-4" />
                </button>
                <button className="p-1 rounded text-gray-400 hover:text-gray-600">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-400 px-4 py-2 border-b border-gray-200/80 mb-2">
            <div className="col-span-5">Form Name</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-center">Responses</div>
            <div className="col-span-2">Updated</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Forms List */}
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading forms...</div>
          ) : filteredForms.length === 0 ? (
            <div className="py-16 bg-white rounded-xl border border-gray-200/80 text-center space-y-3">
              <p className="text-gray-500 text-sm">No forms found in this workspace.</p>
              <button
                onClick={handleCreateForm}
                className="bg-[#262627] hover:bg-black text-white text-xs font-medium px-4 py-2 rounded-lg"
              >
                Create your first form
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  className="grid grid-cols-12 items-center bg-white border border-gray-200/80 hover:border-gray-300 rounded-xl px-4 py-3.5 transition-all shadow-2xs group relative"
                >
                  {/* Form Name & Icon */}
                  <div
                    onClick={() => router.push(`/builder/${form.id}`)}
                    className="col-span-5 flex items-center space-x-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/90 flex items-center justify-center text-white font-bold text-sm shadow-2xs group-hover:bg-purple-600 transition-colors">
                      {form.title.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                      {form.title}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        form.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          form.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      <span className="capitalize">{form.status}</span>
                    </span>
                  </div>

                  {/* Response Count & View Results */}
                  <div className="col-span-2 text-center flex items-center justify-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {form.response_count ?? 0}
                    </span>
                    <button
                      onClick={() => router.push(`/forms/${form.id}/results`)}
                      title="View Results"
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date Updated */}
                  <div className="col-span-2 text-xs text-gray-500">
                    {new Date(form.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  {/* Context Menu Button & Dropdown */}
                  <div className="col-span-1 flex justify-end relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === form.id ? null : form.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    <FormCardContextMenu
                      form={form}
                      isOpen={activeMenuId === form.id}
                      onClose={() => setActiveMenuId(null)}
                      onRename={(f) => {
                        setRenameModalForm(f);
                        setNewTitle(f.title);
                      }}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                      onCopyLink={handleCopyLink}
                      onOpenContent={(fId) => router.push(`/builder/${fId}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Rename Form Modal */}
      {renameModalForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900">Rename form</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Form Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRenameModalForm(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
