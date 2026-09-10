import React, { useState } from "react";
import { CompanyProfile, Client } from "../types";
import { Sparkles, X, Loader2, ArrowRight, Lightbulb, Wand2, CheckCircle2 } from "lucide-react";

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  clients: Client[];
  onApplyGeneratedData: (generatedData: any, docType: "Proposal" | "Quotation", selectedClientId?: string) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  company,
  clients,
  onApplyGeneratedData,
  showToast,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || "");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presetPrompts = [
    "E-commerce website redesign for a fashion boutique with Shopify integration, Stripe payment gateway, and mobile responsive layout.",
    "Native iOS & Android mobile application for real-time fitness tracking with Apple Health kit integration and user subscription billing.",
    "Comprehensive 6-month SEO audit, Google Ads PPC campaign management, and weekly social media content creation for a B2B SaaS startup.",
    "Corporate Brand Identity Package including logo suite, 30-page brand guidelines booklet, stationery print files, and website UI design system."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      showToast("Empty Prompt", "Please enter project details or select a preset prompt.", "warning");
      return;
    }

    setLoading(true);

    try {
      const selectedClient = clients.find((c) => c.id === selectedClientId);

      const res = await fetch("/api/gemini/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          documentType: "Proposal",
          companyName: company.name,
          clientName: selectedClient ? selectedClient.name : "Valued Client",
          currency: company.currency,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "AI generation failed");
      }

      onApplyGeneratedData(json.data, "Proposal", selectedClientId);
      onClose();
      showToast("AI Generation Complete", "Generated complete structured Proposal with Commercial Quotation & Milestones!", "success");
    } catch (err: any) {
      console.error("AI Generation error:", err);
      showToast("Generation Error", err.message || "Failed to generate AI proposal. Please check API key.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shadow-sm font-bold">
              <Sparkles className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">AI Smart Document Generator</h3>
              <p className="text-xs text-slate-400">Generate Unified Proposal & Commercial Quotation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Document Format & Client Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Format</label>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs font-bold text-[#4F46E5]">
                <span>Business Proposal & Quotation</span>
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client (Optional)</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white cursor-pointer"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company ? `${c.company} • ` : ""}{c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompt TextArea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Describe the project or client requirements *
            </label>
            <textarea
              rows={4}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. E-commerce website redesign for a fashion boutique with Shopify integration, payment gateway, SEO, and 30-day warranty..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>

          {/* Preset Prompts Suggestion Pills */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Or click a quick preset prompt:</span>
            </div>
            <div className="space-y-1.5">
              {presetPrompts.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPrompt(preset)}
                  className="w-full text-left p-2.5 rounded-xl text-xs bg-[#F8FAFC] hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-900 border border-slate-200/60 transition-colors line-clamp-2 cursor-pointer font-medium"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400 max-w-xs">
              Gemini will generate structured Scope, Deliverables, Milestones, and Line-Item Quotation.
            </p>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-[#4F46E5] text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating AI Content...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Generate Document</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
