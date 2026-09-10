import React, { useState } from "react";
import { IndustryTemplate } from "../types";
import { X, Plus, Edit2, Trash2, Check, BookOpen, RotateCcw } from "lucide-react";
import { initialIndustryTemplates } from "../data/initialData";

interface TemplateManagerModalProps {
  isOpen: boolean;
  templates: IndustryTemplate[];
  onClose: () => void;
  onSaveTemplates: (templates: IndustryTemplate[]) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  templates,
  onClose,
  onSaveTemplates,
  showToast,
}) => {
  if (!isOpen) return null;

  const [editingTemplate, setEditingTemplate] = useState<IndustryTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State for editing/creating
  const [formData, setFormData] = useState<IndustryTemplate>({
    id: "",
    title: "",
    category: "",
    iconName: "Code",
    defaultOverview: "",
    defaultScope: "",
    defaultDeliverables: [""],
    defaultMilestones: [{ name: "", timeline: "", description: "" }],
    defaultLineItems: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
  });

  const handleStartEdit = (tpl: IndustryTemplate) => {
    setEditingTemplate(tpl);
    setIsCreating(false);
    setFormData(JSON.parse(JSON.stringify(tpl)));
  };

  const handleStartCreate = () => {
    setEditingTemplate(null);
    setIsCreating(true);
    setFormData({
      id: `tpl_custom_${Date.now()}`,
      title: "",
      category: "Software & Web Development",
      iconName: "Code",
      defaultOverview: "",
      defaultScope: "",
      defaultDeliverables: ["Custom Deliverable 1", "Custom Deliverable 2"],
      defaultMilestones: [
        { name: "Phase 1: Kickoff", timeline: "Week 1", description: "Initial setup" },
      ],
      defaultLineItems: [
        { description: "Core Service Package", quantity: 1, unitPrice: 1500, taxRate: 0 },
      ],
    });
  };

  const handleDelete = (id: string) => {
    if (templates.length <= 1) {
      showToast("Cannot Delete", "You must keep at least one industry template.", "warning");
      return;
    }
    const updated = templates.filter((t) => t.id !== id);
    onSaveTemplates(updated);
    showToast("Template Removed", "Industry template deleted successfully.", "success");
    if (editingTemplate?.id === id) {
      setEditingTemplate(null);
      setIsCreating(false);
    }
  };

  const handleResetDefaults = () => {
    onSaveTemplates(initialIndustryTemplates);
    showToast("Templates Reset", "Restored default industry templates.", "info");
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Title Required", "Please enter a template title.", "warning");
      return;
    }

    let updatedList: IndustryTemplate[] = [];
    if (isCreating) {
      updatedList = [...templates, formData];
    } else {
      updatedList = templates.map((t) => (t.id === formData.id ? formData : t));
    }

    onSaveTemplates(updatedList);
    showToast("Template Saved", `Template "${formData.title}" saved successfully.`, "success");
    setEditingTemplate(null);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Manage Quick Insert Industry Templates</h3>
              <p className="text-xs text-slate-400">
                Customize preset scopes, overview text, deliverables, and line item pricing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!editingTemplate && !isCreating ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Available Templates ({templates.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Reset to default templates"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  onClick={handleStartCreate}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Template</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-start justify-between gap-3 group hover:border-indigo-300 transition-all"
                >
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-slate-900 block">{tpl.title}</span>
                    <span className="text-xs text-indigo-600 font-semibold block">{tpl.category}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{tpl.defaultOverview}</p>
                    <div className="text-[10px] text-slate-400 pt-1 font-mono">
                      {tpl.defaultLineItems.length} line items | {tpl.defaultDeliverables.length} deliverables
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(tpl)}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#4F46E5] hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Edit Template"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-all cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Create / Edit Form */
          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900">
                {isCreating ? "Create Custom Template" : `Editing: ${formData.title}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreating(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Back to List
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., E-Commerce Portal Development"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Software & Web Development"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Overview Text</label>
              <textarea
                rows={2}
                value={formData.defaultOverview}
                onChange={(e) => setFormData({ ...formData, defaultOverview: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Scope of Work</label>
              <textarea
                rows={3}
                value={formData.defaultScope}
                onChange={(e) => setFormData({ ...formData, defaultScope: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>

            {/* Line Items Preset */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Preset Line Items</label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      defaultLineItems: [
                        ...formData.defaultLineItems,
                        { description: "New Item", quantity: 1, unitPrice: 500, taxRate: 0 },
                      ],
                    })
                  }
                  className="text-[11px] text-[#4F46E5] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-2">
                {formData.defaultLineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const items = [...formData.defaultLineItems];
                        items[idx].description = e.target.value;
                        setFormData({ ...formData, defaultLineItems: items });
                      }}
                      placeholder="Item Description"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const items = [...formData.defaultLineItems];
                        items[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, defaultLineItems: items });
                      }}
                      placeholder="Unit Price"
                      className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs text-right font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = formData.defaultLineItems.filter((_, i) => i !== idx);
                        setFormData({ ...formData, defaultLineItems: items });
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20"
              >
                Save Template
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
