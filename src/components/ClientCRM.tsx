import React, { useState } from "react";
import { Client, ProposalDocument, CompanyProfile } from "../types";
import { formatCurrency } from "../utils/storage";
import { sanitizeText, sanitizeEmail } from "../utils/sanitize";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  X,
  Check,
  History,
  FileCheck,
} from "lucide-react";

interface ClientCRMProps {
  clients: Client[];
  documents: ProposalDocument[];
  company: CompanyProfile;
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onCreateDocForClient: (client: Client, type: "Proposal" | "Quotation") => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
  initialAddModalOpen?: boolean;
}

export const ClientCRM: React.FC<ClientCRMProps> = ({
  clients,
  documents,
  company,
  onSaveClient,
  onDeleteClient,
  onCreateDocForClient,
  showToast,
  initialAddModalOpen = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(initialAddModalOpen);
  const [selectedClientHistory, setSelectedClientHistory] = useState<Client | null>(null);

  // Form State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    notes: "",
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText((formData.name || "").trim(), 80);
    const cleanEmail = sanitizeEmail((formData.email || "").trim());

    if (!cleanName || !cleanEmail) {
      showToast("Missing Fields", "A valid Client Name and Email are required.", "warning");
      return;
    }

    const newOrUpdated: Client = {
      id: editingClient ? editingClient.id : `cli_${Date.now()}`,
      name: cleanName,
      company: sanitizeText((formData.company || "").trim(), 100),
      email: cleanEmail,
      phone: sanitizeText((formData.phone || "").trim(), 50),
      address: sanitizeText((formData.address || "").trim(), 200),
      taxId: sanitizeText((formData.taxId || "").trim(), 60),
      notes: sanitizeText((formData.notes || "").trim(), 1000),
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
    };

    onSaveClient(newOrUpdated);
    setModalOpen(false);
    showToast(
      editingClient ? "Client Updated" : "Client Created",
      `${newOrUpdated.name} saved to CRM directory.`,
      "success"
    );
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientDocs = (clientId: string) => {
    return documents.filter((d) => d.clientId === clientId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Client CRM Directory</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage client contact records, tax IDs, and document histories
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by client name, company, or email..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] shadow-sm"
        />
      </div>

      {/* Clients Cards Grid (Geometric Balance Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const clientDocs = getClientDocs(client.id);
          const acceptedDocs = clientDocs.filter((d) => d.status === "Accepted");
          const totalVal = acceptedDocs.reduce((sum, d) => sum + d.grandTotal, 0);

          return (
            <div
              key={client.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">{client.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mt-0.5">
                      <Building className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>{client.company || "Individual Client"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Edit Client"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete client "${client.name}"?`)) {
                          onDeleteClient(client.id);
                          showToast("Client Deleted", `${client.name} removed from CRM.`, "info");
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Document History Stat Pill */}
                <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs mt-3">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{clientDocs.length} Documents</span>
                  </div>
                  <span className="font-extrabold text-emerald-600">{formatCurrency(totalVal, company.currency)}</span>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedClientHistory(client)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:text-indigo-700 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History ({clientDocs.length})</span>
                </button>

                <button
                  onClick={() => onCreateDocForClient(client, "Proposal")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-600 shadow-sm transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create Proposal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingClient ? "Edit Client Profile" : "Add New Client to CRM"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="s.jenkins@acme.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax ID / VAT Registration</label>
                  <input
                    type="text"
                    value={formData.taxId || ""}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="e.g. TAX-8890123"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
                  <textarea
                    rows={2}
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address for proposal header"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Special requirements, preferences, or budget limits"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Linked Client History Modal */}
      {selectedClientHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Document History for {selectedClientHistory.name}</h3>
                <p className="text-xs text-slate-500">{selectedClientHistory.company || selectedClientHistory.email}</p>
              </div>
              <button
                onClick={() => setSelectedClientHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {getClientDocs(selectedClientHistory.id).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No proposals or quotations issued to this client yet.
                </div>
              ) : (
                getClientDocs(selectedClientHistory.id).map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{doc.title}</span>
                        <span className="text-xs font-mono text-slate-400">({doc.docNumber})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>Issued: {doc.issueDate}</span>
                        <span>Type: {doc.type}</span>
                        <span className="font-semibold text-slate-700">Status: {doc.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-base text-slate-900 block">
                        {formatCurrency(doc.grandTotal, company.currency)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  const client = selectedClientHistory;
                  setSelectedClientHistory(null);
                  onCreateDocForClient(client, "Proposal");
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-600 shadow-sm cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>+ New Proposal & Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
