import React, { useState } from "react";
import { User, UserRole } from "../types";
import { hashPassword } from "../utils/storage";
import {
  loadAuditLogs,
  logAuditEvent,
  clearAuditLogs,
  AuditLogEntry,
} from "../utils/security";
import {
  sanitizeText,
  sanitizeEmail,
  evaluatePasswordStrength,
} from "../utils/sanitize";
import {
  X,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Key,
  Trash2,
  Lock,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  History,
  AlertTriangle,
  FileCheck,
  Cloud,
  RefreshCw,
} from "lucide-react";
import { pushAllUsersToFirestore } from "../utils/firebaseSync";

interface UserManagementModalProps {
  isOpen: boolean;
  currentUser: User | null;
  users: User[];
  onClose: () => void;
  onSaveUsers: (updatedUsers: User[]) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  currentUser,
  users,
  onClose,
  onSaveUsers,
  showToast,
}) => {
  if (!isOpen) return null;

  const isMasterAdmin = currentUser?.role === "Master Admin";

  const [activeTab, setActiveTab] = useState<"list" | "add" | "audit">("list");

  // Form State for Adding New User
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Manager");
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset Modal State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState("");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(loadAuditLogs);
  const [syncingFirebase, setSyncingFirebase] = useState(false);

  const passwordStrength = evaluatePasswordStrength(newPassword);
  const resetPasswordStrength = evaluatePasswordStrength(resetNewPassword);

  const handlePushUsersToFirebase = async () => {
    setSyncingFirebase(true);
    try {
      const res = await pushAllUsersToFirestore(users);
      if (res.success) {
        showToast(
          "Firebase Synced!",
          `Successfully pushed ${res.count} user accounts to Google Firebase Firestore.`,
          "success"
        );
      } else {
        showToast("Sync Notice", "Unable to push users at the moment.", "warning");
      }
    } catch (e: any) {
      showToast("Sync Error", e?.message || "Failed to push users to Firebase", "error");
    } finally {
      setSyncingFirebase(false);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = sanitizeText(newUsername.trim().toLowerCase(), 40);
    const cleanName = sanitizeText(newName.trim(), 80);
    const cleanEmail = sanitizeEmail(newEmail.trim()) || `${cleanUsername}@xyrongroup.com`;

    if (!cleanUsername || !cleanName || !newPassword) {
      showToast("Validation Error", "Please fill in all required user fields.", "error");
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      showToast("Username Taken", `Username '${cleanUsername}' already exists. Choose another.`, "error");
      return;
    }

    if (newPassword.length < 8) {
      showToast("Security Standard", "Password must be at least 8 characters long.", "warning");
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUsername,
      name: cleanName,
      email: cleanEmail,
      role: newRole,
      passwordHash: hashPassword(newPassword),
      createdAt: new Date().toISOString().split("T")[0],
      active: true,
    };

    const updated = [...users, newUser];
    onSaveUsers(updated);

    logAuditEvent(
      currentUser,
      "USER_CREATED",
      `Created user '${newUser.username}' with role '${newUser.role}'`,
      "SUCCESS"
    );
    setAuditLogs(loadAuditLogs());

    showToast("User Created", `Successfully added ${newUser.name} as ${newUser.role}`, "success");

    // Reset Form
    setNewUsername("");
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("Manager");
    setActiveTab("list");
  };

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser?.id) {
      showToast("Action Prohibited", "You cannot suspend your own account.", "warning");
      return;
    }

    const nextStatus = !user.active;
    const updated = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, active: nextStatus };
      }
      return u;
    });

    onSaveUsers(updated);
    logAuditEvent(
      currentUser,
      "USER_STATUS_CHANGE",
      `Changed user '${user.username}' status to ${nextStatus ? "Active" : "Suspended"}`,
      "SUCCESS"
    );
    setAuditLogs(loadAuditLogs());

    showToast(
      "Account Access Updated",
      `${user.name}'s account status is now ${nextStatus ? "Active" : "Suspended"}`,
      "info"
    );
  };

  const handleChangeRole = (user: User, role: UserRole) => {
    if (user.id === currentUser?.id && role !== "Master Admin") {
      showToast("Action Prohibited", "You cannot downgrade your own Master Admin role.", "warning");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, role };
      }
      return u;
    });

    onSaveUsers(updated);
    logAuditEvent(
      currentUser,
      "USER_ROLE_CHANGE",
      `Changed user '${user.username}' role from '${user.role}' to '${role}'`,
      "SUCCESS"
    );
    setAuditLogs(loadAuditLogs());

    showToast("Role Updated", `${user.name}'s role changed to ${role}`, "success");
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      showToast("Action Prohibited", "You cannot delete your own active account.", "warning");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete user account '${user.name}'?`)) return;

    const updated = users.filter((u) => u.id !== user.id);
    onSaveUsers(updated);

    logAuditEvent(
      currentUser,
      "USER_DELETED",
      `Deleted user account '${user.username}' (${user.role})`,
      "WARNING"
    );
    setAuditLogs(loadAuditLogs());

    showToast("User Removed", `User ${user.name} has been removed from the system.`, "info");
  };

  const handleExecuteResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !resetNewPassword) return;

    if (resetNewPassword.length < 8) {
      showToast("Security Standard", "New password must be at least 8 characters long.", "warning");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === resetTargetUser.id) {
        return {
          ...u,
          passwordHash: hashPassword(resetNewPassword),
        };
      }
      return u;
    });

    onSaveUsers(updated);
    logAuditEvent(
      currentUser,
      "USER_PASSWORD_RESET",
      `Master Admin reset password for user '${resetTargetUser.username}'`,
      "SUCCESS"
    );
    setAuditLogs(loadAuditLogs());

    showToast("Password Reset", `Updated password for ${resetTargetUser.name}`, "success");
    setResetTargetUser(null);
    setResetNewPassword("");
  };

  const handleClearAuditLogs = () => {
    if (confirm("Are you sure you want to purge all security audit log records?")) {
      clearAuditLogs();
      setAuditLogs([]);
      logAuditEvent(currentUser, "AUDIT_LOGS_PURGED", "Security audit logs cleared by Master Admin", "WARNING");
      setAuditLogs(loadAuditLogs());
      showToast("Logs Cleared", "Security audit log archive has been purged.", "info");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#4F46E5] text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">Enterprise User & Security Center</h2>
              <p className="text-xs text-slate-400">Master Admin Control Panel • RBAC & Audit Trail</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Restriction Check */}
        {!isMasterAdmin ? (
          <div className="p-8 text-center space-y-3">
            <Shield className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-bold text-slate-900">Access Restricted</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Only the <strong>Master Admin</strong> is authorized to manage user accounts, roles, and security permissions.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeTab === "list"
                    ? "border-[#4F46E5] text-[#4F46E5] bg-white shadow-sm"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Active Users ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("add")}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeTab === "add"
                    ? "border-[#4F46E5] text-[#4F46E5] bg-white shadow-sm"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New User</span>
              </button>

              <button
                onClick={() => {
                  setAuditLogs(loadAuditLogs());
                  setActiveTab("audit");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeTab === "audit"
                    ? "border-[#4F46E5] text-[#4F46E5] bg-white shadow-sm"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Security Audit Trail ({auditLogs.length})</span>
              </button>

              <div className="ml-auto pb-2 flex items-center gap-2">
                <button
                  onClick={handlePushUsersToFirebase}
                  disabled={syncingFirebase}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Push all user accounts directly to Firebase Firestore"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{syncingFirebase ? "Pushing..." : "Push Users to Firebase"}</span>
                  {syncingFirebase && <RefreshCw className="w-3 h-3 animate-spin" />}
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {activeTab === "list" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
                    <span className="font-medium">
                      💡 <strong>Role-Based Access Control (RBAC):</strong> Master Admin has full platform privileges. Managers can create and edit documents. Standard Users have drafting access.
                    </span>
                    <button
                      onClick={() => setActiveTab("add")}
                      className="px-3 py-1.5 rounded-xl bg-[#4F46E5] text-white font-bold text-[11px] hover:bg-indigo-600 shrink-0 cursor-pointer shadow"
                    >
                      + Add User
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">User Details</th>
                          <th className="py-3 px-3">Role</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.id === currentUser?.id && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    @{u.username} • {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                                className="text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#4F46E5] focus:outline-none cursor-pointer"
                              >
                                <option value="Master Admin">Master Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Standard User">Standard User</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-3">
                              <button
                                onClick={() => handleToggleActive(u)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                                  u.active
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                                }`}
                                title="Click to toggle account status"
                              >
                                {u.active ? "Active" : "Suspended"}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setResetTargetUser(u)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                  title="Reset Password"
                                >
                                  <Key className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "add" && (
                <form onSubmit={handleAddUser} className="space-y-4 max-w-lg mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#4F46E5]" />
                    <span>Create New Enterprise User</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="e.g. sjenkins"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="sjenkins@xyrongroup.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 chars, mixed"
                          className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {newPassword && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Strength:</span>
                            <span
                              className={`font-bold ${
                                passwordStrength.strengthLabel === "Strong"
                                  ? "text-emerald-600"
                                  : passwordStrength.strengthLabel === "Good"
                                  ? "text-blue-600"
                                  : passwordStrength.strengthLabel === "Fair"
                                  ? "text-amber-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {passwordStrength.strengthLabel}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                passwordStrength.score >= 4
                                  ? "w-full bg-emerald-500"
                                  : passwordStrength.score === 3
                                  ? "w-3/4 bg-blue-500"
                                  : passwordStrength.score === 2
                                  ? "w-1/2 bg-amber-500"
                                  : "w-1/4 bg-rose-500"
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role *</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-[#4F46E5] focus:outline-none cursor-pointer bg-white"
                      >
                        <option value="Manager">Manager (Full Document & Sales)</option>
                        <option value="Standard User">Standard User (Drafting)</option>
                        <option value="Master Admin">Master Admin (Full Access)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("list")}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      Save & Grant Access
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "audit" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-600">
                      Security audit events logged across authentication, user management, and sensitive operations.
                    </p>
                    <button
                      onClick={handleClearAuditLogs}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Purge Logs
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">Actor</th>
                          <th className="py-2.5 px-3">Action</th>
                          <th className="py-2.5 px-3">Details</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-mono">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                              @{log.actorUsername} ({log.actorRole})
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#4F46E5] whitespace-nowrap">
                              {log.action}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                              {log.details}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.status === "SUCCESS"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : log.status === "DENIED"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Reset Password Sub-Modal */}
        {resetTargetUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <form
              onSubmit={handleExecuteResetPassword}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#4F46E5]" />
                  <span>Reset User Password</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Set a new password for user <strong>{resetTargetUser.name}</strong> (@{resetTargetUser.username}).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min 8 chars)</label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                  required
                />

                {resetNewPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Strength:</span>
                      <span
                        className={`font-bold ${
                          resetPasswordStrength.strengthLabel === "Strong"
                            ? "text-emerald-600"
                            : resetPasswordStrength.strengthLabel === "Good"
                            ? "text-blue-600"
                            : resetPasswordStrength.strengthLabel === "Fair"
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {resetPasswordStrength.strengthLabel}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-indigo-600 rounded-lg shadow cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
