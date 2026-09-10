import React, { useState } from "react";
import { CompanyProfile, User, ThemeSettings } from "../types";
import { XyronLogo } from "./XyronLogo";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Sparkles,
  Plus,
  Globe,
  Menu,
  X,
  FilePlus,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Settings,
  FolderCheck,
  CheckCircle2,
  FileSpreadsheet,
  Rocket,
} from "lucide-react";

export type NavTab = "dashboard" | "documents" | "invoices" | "completed" | "crm" | "settings" | "editor";

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  company: CompanyProfile;
  currentUser: User | null;
  themeSettings: ThemeSettings;
  onToggleThemeMode: () => void;
  onOpenEditProfile: () => void;
  onOpenNewDoc: (type: "Proposal" | "Quotation") => void;
  onOpenAIGenerator: () => void;
  onOpenNewClient: () => void;
  onOpenUserManagement: () => void;
  onOpenLauncherModal?: () => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  company,
  currentUser,
  themeSettings,
  onToggleThemeMode,
  onOpenEditProfile,
  onOpenNewDoc,
  onOpenAIGenerator,
  onOpenNewClient,
  onOpenUserManagement,
  onOpenLauncherModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMasterAdmin = currentUser?.role === "Master Admin";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "documents", label: "Proposals", icon: FileText },
    { id: "invoices", label: "Invoices & Receipts", icon: FileSpreadsheet },
    { id: "completed", label: "Completed Projects", icon: FolderCheck },
    { id: "crm", label: "Client CRM", icon: Users },
    ...(isMasterAdmin ? [{ id: "settings", label: "Settings & Themes", icon: Building2 }] : []),
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (DocApp Inspired Soft Canvas with High-Contrast Layout) */}
      <aside className="w-64 bg-[#0F172A] dark:bg-slate-950 text-slate-300 hidden md:flex flex-col shrink-0 fixed inset-y-0 left-0 z-30 border-r border-slate-800/80">
        <div className="p-5 flex flex-col justify-between h-full min-h-full overflow-y-auto">
          <div className="space-y-5">
            {/* Brand Logo & Theme Mode Toggle Header */}
            <div className="flex items-center justify-between">
              <div className="cursor-pointer" onClick={() => handleTabClick("dashboard")}>
                <XyronLogo className="h-9" variant="light" />
              </div>

              {/* Quick Dark / Light Toggle */}
              <button
                type="button"
                onClick={onToggleThemeMode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={themeSettings.mode === "light" ? "Switch to Obsidian Dark Mode" : "Switch to Clean Light Mode"}
              >
                {themeSettings.mode === "light" ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>

            {/* Live Cloud Sync Indicator */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between text-[11px] shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-200">Firebase Cloud</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Online
              </span>
            </div>

            {/* User Account Info Box (Inspired by DocApp Dr Anne Snowdon Profile Pill) */}
            {currentUser && (
              <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-2 shadow-sm">
                <div
                  className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
                  onClick={onOpenEditProfile}
                  title="Click to edit your profile"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {currentUser.name}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenEditProfile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Edit My Profile"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Nav Items */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id as NavTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-900/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Master Admin User Management Link */}
              {isMasterAdmin && (
                <button
                  onClick={onOpenUserManagement}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-900/40 border border-indigo-500/20 transition-all cursor-pointer mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>User Roles & Security</span>
                </button>
              )}
            </nav>
          </div>

          {/* Quick Creator Section */}
          <div className="pt-5 border-t border-slate-800/80 space-y-2.5 mt-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
              Quick Actions
            </span>
            <button
              onClick={() => onOpenNewDoc("Proposal")}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Proposal</span>
            </button>
            <button
              onClick={onOpenAIGenerator}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Smart Generator</span>
            </button>
            {onOpenLauncherModal && (
              <button
                type="button"
                onClick={onOpenLauncherModal}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                title="1-Click App Launcher"
              >
                <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click App Launcher</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Top Header & Drawer */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0F172A]/95 dark:bg-slate-950/95 backdrop-blur-md text-slate-100 border-b border-slate-800/80 shadow-md">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => handleTabClick("dashboard")}>
            <XyronLogo className="h-8" variant="light" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onToggleThemeMode}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              title="Toggle Theme"
            >
              {themeSettings.mode === "light" ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {isMasterAdmin && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="p-2.5 rounded-xl bg-indigo-950/90 text-indigo-300 border border-indigo-800/60 min-h-[40px] min-w-[40px] flex items-center justify-center font-bold cursor-pointer"
                title="User Security"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAIGenerator}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white min-h-[40px] shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Backdrop for Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-16 bg-slate-950/70 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="relative z-40 bg-[#0F172A] dark:bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {currentUser && (
              <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-2 shadow-sm">
                <div
                  className="flex items-center gap-2.5 cursor-pointer min-w-0"
                  onClick={() => {
                    onOpenEditProfile();
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <span className="inline-block text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenEditProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
                    title="Edit Profile"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-bold cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between text-[11px] shadow-sm mb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-200">Firebase Cloud</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Online
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabClick(item.id as NavTab)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold w-full text-left transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/50"
                        : "text-slate-300 hover:bg-slate-800/80 active:bg-slate-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {isMasterAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenUserManagement();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-indigo-300 bg-indigo-900/40 border border-indigo-700/50 min-h-[44px] cursor-pointer mt-1"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>User Roles & Security</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Quick Actions
              </span>
              <button
                type="button"
                onClick={() => {
                  onOpenNewDoc("Proposal");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white min-h-[44px] shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Proposal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenAIGenerator();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 min-h-[44px] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Smart Generator</span>
              </button>
              {onOpenLauncherModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenLauncherModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 min-h-[44px] cursor-pointer"
                >
                  <Rocket className="w-4 h-4 text-emerald-400" />
                  <span>1-Click App Launcher</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
