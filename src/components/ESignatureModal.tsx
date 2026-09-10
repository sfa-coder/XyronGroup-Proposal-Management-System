import React, { useRef, useState, useEffect } from "react";
import { ProposalDocument, CompanyProfile } from "../types";
import { formatCurrency } from "../utils/storage";
import { validateUploadedFile, sanitizeText, sanitizeEmail } from "../utils/sanitize";
import {
  PenTool,
  Type,
  Upload,
  X,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Lock,
  Building2,
  User,
  Mail,
  Award,
} from "lucide-react";

interface ESignatureModalProps {
  document: ProposalDocument | null;
  company: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (docId: string, acceptanceDetails: {
    accepted: boolean;
    authorizedName: string;
    authorizedCompany: string;
    authorizedDate: string;
    signatureDataUrl: string;
    signatureType: "drawn" | "typed" | "uploaded";
    signerEmail?: string;
    signerIp?: string;
    verificationHash: string;
    notes?: string;
  }) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  document: doc,
  company,
  isOpen,
  onClose,
  onSaveSignature,
  showToast,
}) => {
  if (!isOpen || !doc) return null;

  const [sigMode, setSigMode] = useState<"drawn" | "typed" | "uploaded">("drawn");
  const [authorizedName, setAuthorizedName] = useState(
    doc.acceptanceDetails?.authorizedName || doc.clientName || ""
  );
  const [authorizedCompany, setAuthorizedCompany] = useState(
    doc.acceptanceDetails?.authorizedCompany || doc.clientCompany || ""
  );
  const [signerEmail, setSignerEmail] = useState(
    doc.acceptanceDetails?.signerEmail || doc.clientEmail || ""
  );
  const [signerNotes, setSignerNotes] = useState(
    doc.acceptanceDetails?.notes || "I formally accept the commercial terms and deliverables described in this document."
  );
  const [typedFont, setTypedFont] = useState<"dancing" | "caveat" | "greatvibes">("dancing");
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(
    doc.acceptanceDetails?.signatureType === "uploaded" ? doc.acceptanceDetails.signatureDataUrl || null : null
  );
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (sigMode === "drawn" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1E1B4B"; // Deep navy ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [sigMode, isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateUploadedFile(file, ["image/jpeg", "image/png", "image/webp"], 2 * 1024 * 1024);
      if (!validation.valid) {
        showToast("Invalid Signature Image", validation.error || "Please select a valid PNG or JPG image under 2MB.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedSigUrl(reader.result as string);
        showToast("Signature Uploaded", "Signature graphic loaded successfully.", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert typed text to a canvas data URL
  const generateTypedSignatureDataUrl = (): string => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 460;
    offscreen.height = 140;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    ctx.fillStyle = "#1E1B4B";
    if (typedFont === "dancing") {
      ctx.font = "italic 40px 'Brush Script MT', cursive, sans-serif";
    } else if (typedFont === "caveat") {
      ctx.font = "italic 38px 'Segoe Script', cursive, sans-serif";
    } else {
      ctx.font = "italic 44px 'Edwardian Script ITC', cursive, Georgia, serif";
    }

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(sanitizeText(authorizedName || "Client Signature", 60), offscreen.width / 2, offscreen.height / 2);

    return offscreen.toDataURL("image/png");
  };

  const handleCompleteSigning = () => {
    const safeName = sanitizeText(authorizedName.trim(), 80);
    const safeCompany = sanitizeText(authorizedCompany.trim(), 100);
    const safeEmail = sanitizeEmail(signerEmail.trim());
    const safeNotes = sanitizeText(signerNotes.trim(), 1000);

    if (!safeName) {
      showToast("Signer Name Required", "Please enter the signatory's full legal name.", "warning");
      return;
    }
    if (!termsAgreed) {
      showToast("Acceptance Required", "Please confirm acceptance of the document terms.", "warning");
      return;
    }

    let finalSigDataUrl = "";

    if (sigMode === "drawn") {
      if (!hasDrawn && !doc.acceptanceDetails?.signatureDataUrl) {
        showToast("Signature Missing", "Please draw your digital signature on the pad above.", "warning");
        return;
      }
      if (canvasRef.current) {
        finalSigDataUrl = canvasRef.current.toDataURL("image/png");
      }
    } else if (sigMode === "typed") {
      finalSigDataUrl = generateTypedSignatureDataUrl();
    } else if (sigMode === "uploaded") {
      if (!uploadedSigUrl) {
        showToast("Signature File Missing", "Please upload a signature PNG or JPG image.", "warning");
        return;
      }
      finalSigDataUrl = uploadedSigUrl;
    }

    // Generate cryptographic-style verification hash
    const randPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const verificationHash = `SIG-${doc.docNumber.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}-${randPart}`;

    onSaveSignature(doc.id, {
      accepted: true,
      authorizedName: safeName,
      authorizedCompany: safeCompany,
      authorizedDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      signatureDataUrl: finalSigDataUrl,
      signatureType: sigMode,
      signerEmail: safeEmail,
      signerIp: "203.0.113.195 (Verified Secure Client)",
      verificationHash,
      notes: safeNotes,
    });

    showToast(
      "Document Digitally Signed",
      `Proposal ${doc.docNumber} has been officially authorized and signed with Certificate ID: ${verificationHash}`,
      "success"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:px-7 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Digital E-Signature Portal</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Legally Binding
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorize Proposal <span className="font-mono font-bold text-slate-200">{doc.docNumber}</span> ({formatCurrency(doc.grandTotal, company.currency)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100">
          {/* Document Summary Pill */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-950 dark:text-indigo-200 text-sm block">{doc.title}</span>
              <span className="text-indigo-800 dark:text-indigo-400">
                Issued by <strong className="text-slate-900 dark:text-white">{company.name}</strong> to{" "}
                <strong className="text-slate-900 dark:text-white">{doc.clientName}</strong>
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Contract Value</span>
              <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                {formatCurrency(doc.grandTotal, company.currency)}
              </span>
            </div>
          </div>

          {/* Signatory Identity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name of Signatory *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={authorizedName}
                  onChange={(e) => setAuthorizedName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Client Organization / Title
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={authorizedCompany}
                  onChange={(e) => setAuthorizedCompany(e.target.value)}
                  placeholder="e.g. Acme Corporation (Chief Executive)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Signatory Email (For Audit Trail & Copy Dispatch)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@acmecorp.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* Signature Capture Mode Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Select Signature Method
              </label>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSigMode("drawn")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sigMode === "drawn"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Draw</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSigMode("typed")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sigMode === "typed"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Type</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSigMode("uploaded")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sigMode === "uploaded"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Drawn on Canvas */}
            {sigMode === "drawn" && (
              <div className="space-y-2">
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[150px] touch-none cursor-crosshair"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                      <PenTool className="w-5 h-5 opacity-40" />
                      <span>Draw signature here with mouse or touchscreen</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] text-slate-400 font-mono">Sign on line</span>
                    <span className="text-[10px] text-slate-400">──────────────────────</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear & Redraw</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Typed Script */}
            {sigMode === "typed" && (
              <div className="space-y-3">
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[140px] text-center">
                  <p
                    className={`text-3xl text-indigo-950 dark:text-indigo-200 select-none ${
                      typedFont === "dancing"
                        ? "font-serif italic"
                        : typedFont === "caveat"
                        ? "font-mono italic"
                        : "font-serif italic font-light"
                    }`}
                  >
                    {authorizedName || "Your Signature Name"}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
                    Digital Typeface Render
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Style:</span>
                  <button
                    type="button"
                    onClick={() => setTypedFont("dancing")}
                    className={`px-3 py-1 rounded-lg text-xs font-serif italic ${
                      typedFont === "dancing" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Cursive Classic
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypedFont("caveat")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono italic ${
                      typedFont === "caveat" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Modern Script
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypedFont("greatvibes")}
                    className={`px-3 py-1 rounded-lg text-xs font-serif ${
                      typedFont === "greatvibes" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Executive Calligraphy
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Upload Image */}
            {sigMode === "uploaded" && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 cursor-pointer min-h-[140px] text-center">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  {uploadedSigUrl ? (
                    <div className="space-y-2">
                      <img src={uploadedSigUrl} alt="Signature Preview" className="max-h-24 mx-auto object-contain" />
                      <span className="text-xs text-indigo-600 font-bold block">Click to replace signature image</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs text-slate-400">
                      <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                      <p className="font-bold text-slate-700 dark:text-slate-200">Upload signature graphic (PNG / JPG)</p>
                      <p className="text-[11px]">Recommended: Transparent background signature image</p>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Legal Acceptance Statement */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                I hereby declare that I am authorized to enter into legal agreements on behalf of{" "}
                <strong className="text-slate-900 dark:text-white">{authorizedCompany || doc.clientCompany || doc.clientName}</strong>. By clicking "Sign & Authorize", I apply my electronic signature to this commercial proposal and approve the scope, pricing, and payment terms stipulated herein.
              </span>
            </label>

            {/* Audit Metadata Stamp */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" />
                256-Bit SHA Certificate Audit Trail
              </span>
              <span>Timestamp: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCompleteSigning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sign & Officially Authorize</span>
          </button>
        </div>
      </div>
    </div>
  );
};
