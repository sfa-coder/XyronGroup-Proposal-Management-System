import React, { useState } from "react";
import { User } from "../types";
import { hashPassword } from "../utils/storage";
import { sanitizeText, evaluatePasswordStrength } from "../utils/sanitize";
import { logAuditEvent } from "../utils/security";
import { ShieldCheck, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";

interface FirstLoginSetupModalProps {
  isOpen: boolean;
  currentUser: User | null;
  users: User[];
  onCompleteSetup: (updatedUser: User) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const FirstLoginSetupModal: React.FC<FirstLoginSetupModalProps> = ({
  isOpen,
  currentUser,
  users,
  onCompleteSetup,
  showToast,
}) => {
  if (!isOpen || !currentUser) return null;

  const [newUsername, setNewUsername] = useState(currentUser.username === "admin" ? "" : currentUser.username);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passStrength = evaluatePasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanUser = sanitizeText(newUsername.trim().toLowerCase(), 40);
    if (!cleanUser) {
      setErrorMessage("Please enter a valid username.");
      return;
    }

    // Check if username is taken by another account
    const existing = users.find(
      (u) => u.username.toLowerCase() === cleanUser && u.id !== currentUser.id
    );
    if (existing) {
      setErrorMessage(`Username '${cleanUser}' is already taken. Please choose another.`);
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      username: cleanUser,
      passwordHash: hashPassword(newPassword),
      isFirstLogin: false,
    };

    logAuditEvent(
      updatedUser,
      "FIRST_LOGIN_SETUP_COMPLETED",
      `First login credential setup completed for user '${cleanUser}'`,
      "SUCCESS"
    );

    onCompleteSetup(updatedUser);
    showToast("Credentials Secured!", "Your custom username and password have been set.", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-white space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#4F46E5]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-blue-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">First-Time Account Setup</h2>
          <p className="text-xs text-slate-400">
            Create your custom username and secure password to replace default system credentials.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Set Custom Username *</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Choose custom username"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Set Secure Password (Min 8 chars) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, numbers"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Strength:</span>
                <span className="font-bold text-emerald-400">{passStrength.strengthLabel}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-500/25 cursor-pointer mt-3"
          >
            Lock In & Activate Account
          </button>
        </form>
      </div>
    </div>
  );
};
