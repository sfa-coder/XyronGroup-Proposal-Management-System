import React, { useState } from "react";
import { User } from "../types";
import { hashPassword } from "../utils/storage";
import { sanitizeText, sanitizeEmail, evaluatePasswordStrength } from "../utils/sanitize";
import { logAuditEvent } from "../utils/security";
import { X, User as UserIcon, Mail, ShieldCheck, Save } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUpdateUser,
  showToast,
}) => {
  if (!isOpen || !currentUser) return null;

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [username, setUsername] = useState(currentUser.username);

  // Password change states
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const newPassStrength = evaluatePasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = sanitizeText(name.trim(), 80);
    const cleanEmail = sanitizeEmail(email.trim());
    const cleanUsername = sanitizeText(username.trim().toLowerCase(), 40);

    if (!cleanName) {
      showToast("Validation Error", "Name cannot be empty.", "warning");
      return;
    }
    if (!cleanEmail) {
      showToast("Validation Error", "Please provide a valid email address.", "warning");
      return;
    }
    if (!cleanUsername) {
      showToast("Validation Error", "Username cannot be empty.", "warning");
      return;
    }

    let updatedPasswordHash = currentUser.passwordHash;

    if (changePassword) {
      if (!currentPassword) {
        showToast("Password Required", "Please enter your current password.", "warning");
        return;
      }
      // Verify current password
      if (hashPassword(currentPassword) !== currentUser.passwordHash) {
        showToast("Incorrect Password", "The current password entered is incorrect.", "error");
        logAuditEvent(currentUser, "PASSWORD_CHANGE_FAILED", "Failed current password verification attempt", "DENIED");
        return;
      }
      if (newPassword.length < 8) {
        showToast("Weak Password", "New password must be at least 8 characters long.", "warning");
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast("Password Mismatch", "New password and confirmation do not match.", "warning");
        return;
      }
      updatedPasswordHash = hashPassword(newPassword);
    }

    const updatedUser: User = {
      ...currentUser,
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      passwordHash: updatedPasswordHash,
    };

    logAuditEvent(
      currentUser,
      "USER_PROFILE_UPDATED",
      `User '${cleanUsername}' updated profile details${changePassword ? " and password" : ""}.`,
      "SUCCESS"
    );

    onUpdateUser(updatedUser);
    showToast("Profile Updated", "Your personal profile details have been saved securely.", "success");

    // Reset password fields
    setChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Edit My Profile</h2>
              <p className="text-xs text-slate-400">Update personal details & secure credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* User Badge Info */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentUser.role} Account
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Active
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Business Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Password Change Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Change Password</span>
            </label>

            {changePassword && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required={changePassword}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      New Password (Min 8 chars)
                    </label>
                    <input
                      type="password"
                      required={changePassword}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {newPassword && (
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {newPassStrength.strengthLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required={changePassword}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
