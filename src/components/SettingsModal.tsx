import React from 'react';
import { X, Settings, Shield, Moon, Bell, RotateCcw, Download } from 'lucide-react';
import { UserPreferences } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onTogglePreference: (key: keyof UserPreferences) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onTogglePreference,
  onResetData,
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(preferences, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `minddojo_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Controls</h3>
              <p className="text-[11px] font-mono text-slate-500">Local Preferences & Data Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Parameters
            </h4>

            <div
              onClick={() => onTogglePreference('notificationsEnabled')}
              className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Push Notifications</p>
                  <p className="text-[11px] text-slate-500">Morning & Evening reflection alerts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notificationsEnabled}
                onChange={() => {}}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div
              onClick={() => onTogglePreference('darkMode')}
              className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Theme Palette</p>
                  <p className="text-[11px] text-slate-500">High-contrast night display</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={() => {}}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div
              onClick={() => onTogglePreference('privacyLocked')}
              className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Encrypted Browser Storage</p>
                  <p className="text-[11px] text-slate-500">Local isolation privacy lock</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.privacyLocked}
                onChange={() => {}}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Backup & Reset */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Data Operations
            </h4>

            <button
              onClick={handleExport}
              className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Local Data Backup (JSON)</span>
            </button>

            <button
              onClick={onResetData}
              className="w-full py-3 px-4 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Purge Local Session Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


