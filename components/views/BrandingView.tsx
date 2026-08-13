import React, { useState } from 'react';
import { Shield, Award, Lock, Save, Sparkles, CheckCircle, Palette, Image as ImageIcon, Globe, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { PageHeader, Card } from '../UI';

export const BrandingView: React.FC = () => {
  const [orgName, setOrgName] = useState('Cyverax Solutions');
  const [logoPreset, setLogoPreset] = useState('horus-gold');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('indigo');
  const [loginSubtitle, setLoginSubtitle] = useState('Unified Cybersecurity Operations & Protection Platform');
  const [hidePoweredBy, setHidePoweredBy] = useState(true);
  
  // Interactive toggle to preview non-platinum locked state vs active platinum unlocked state
  const [simulateLockedTier, setSimulateLockedTier] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (simulateLockedTier) return;
    setSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const isLocked = simulateLockedTier;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <PageHeader title="Custom Branding & Whitelabel Settings">
        <div className="flex items-center gap-3">
          {/* Simulator Toggle for testing both Platinum and Locked non-platinum states */}
          <button
            type="button"
            onClick={() => setSimulateLockedTier(!simulateLockedTier)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
              simulateLockedTier
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}
          >
            {simulateLockedTier ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{simulateLockedTier ? 'Previewing Locked Tier' : 'Platinum Tier Active'}</span>
          </button>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-600 dark:text-amber-400 font-extrabold text-xs">
            <Award size={16} />
            <span>PLATINUM EXCLUSIVE</span>
          </div>
        </div>
      </PageHeader>

      {/* Lock / Unlocked Status Banner */}
      {isLocked ? (
        <div className="p-5 bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
              <Lock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-amber-400">Custom Branding Locked — Standard / Pro Tier</h3>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">Requires Platinum</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Custom Organization Logos, Brand Color Accents, and Whitelabel Footer Removal require a <strong>Cyverax Platinum Enterprise Membership</strong>. Upgrade your account under Memberships to unlock custom branding.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulateLockedTier(false)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shrink-0 transition-all"
          >
            Unlock Platinum Features
          </button>
        </div>
      ) : (
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/60 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-4 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-amber-400">Platinum Enterprise Whitelabel Unlocked</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">Active & Unlocked</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Your <strong>Cyverax Platinum Membership</strong> grants full customization over console logos, brand primary themes, and white-label login screens.
              </p>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>Branding settings successfully updated across the Eye of Horus console!</span>
        </div>
      )}

      <form onSubmit={handleSaveBranding} className="space-y-6">
        
        {/* Organization Identity */}
        <Card className={`space-y-6 border border-slate-200 dark:border-gray-800 relative transition-opacity ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          {isLocked && (
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center">
              <div className="bg-slate-900/90 border border-amber-500/40 px-4 py-2 rounded-xl text-amber-400 text-xs font-bold flex items-center gap-2 shadow-2xl">
                <Lock size={16} /> Locked under Platinum Membership
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-gray-800 pb-3">
            <Shield className="text-amber-500" size={20} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Organization Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                Organization / Company Name
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Cyverax Solutions"
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                Login Screen Greeting Subtitle
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={loginSubtitle}
                onChange={(e) => setLoginSubtitle(e.target.value)}
                placeholder="Unified Cybersecurity Operations & Protection Platform"
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </Card>

        {/* Logo & Visual Assets */}
        <Card className={`space-y-6 border border-slate-200 dark:border-gray-800 relative transition-opacity ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          {isLocked && (
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center">
              <div className="bg-slate-900/90 border border-amber-500/40 px-4 py-2 rounded-xl text-amber-400 text-xs font-bold flex items-center gap-2 shadow-2xl">
                <Lock size={16} /> Locked under Platinum Membership
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-gray-800 pb-3">
            <ImageIcon className="text-indigo-500" size={20} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Brand Logo & Symbols</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                Console Header Logo Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'horus-gold', name: 'Eye of Horus Cyber Gold', desc: 'Default Cyverax Platinum emblem' },
                  { id: 'horus-neon', name: 'Eye of Horus Neon Cyan', desc: 'High-contrast neon security theme' },
                  { id: 'custom-upload', name: 'Custom SVG / PNG Logo', desc: 'Upload or host custom company vector' },
                ].map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    disabled={isLocked}
                    onClick={() => setLogoPreset(preset.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      logoPreset === preset.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md'
                        : 'bg-slate-50 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{preset.name}</span>
                      {logoPreset === preset.id && <CheckCircle size={14} className="text-amber-500" />}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {logoPreset === 'custom-upload' && (
              <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Custom Logo URL (.svg / .png)
                </label>
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://yourcompany.com/assets/logo.svg"
                  className="w-full bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Brand Theme Palette & Whitelabeling */}
        <Card className={`space-y-6 border border-slate-200 dark:border-gray-800 relative transition-opacity ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          {isLocked && (
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center">
              <div className="bg-slate-900/90 border border-amber-500/40 px-4 py-2 rounded-xl text-amber-400 text-xs font-bold flex items-center gap-2 shadow-2xl">
                <Lock size={16} /> Locked under Platinum Membership
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-gray-800 pb-3">
            <Palette className="text-cyan-500" size={20} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Primary Theme Accent & Whitelabel Mode</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                Primary Brand Accent Color
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'indigo', name: 'Cyber Indigo', colorClass: 'bg-indigo-600' },
                  { id: 'amber', name: 'Platinum Gold', colorClass: 'bg-amber-500' },
                  { id: 'emerald', name: 'SOC Emerald', colorClass: 'bg-emerald-500' },
                  { id: 'crimson', name: 'Threat Red', colorClass: 'bg-red-600' },
                ].map((col) => (
                  <button
                    type="button"
                    key={col.id}
                    disabled={isLocked}
                    onClick={() => setPrimaryColor(col.id)}
                    className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                      primaryColor === col.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-md'
                        : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/60 text-slate-700 dark:text-gray-300'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${col.colorClass}`} />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Whitelabel Switch */}
            <div className="p-4 bg-slate-50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe size={16} className="text-indigo-500" />
                  <span>Whitelabel Mode (Hide Default Platform Branding)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Removes default "Powered by Cyverax Solutions" footers and replaces login screen prompts with your custom organization branding.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  disabled={isLocked}
                  checked={hidePoweredBy}
                  onChange={(e) => setHidePoweredBy(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 rounded-full"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLocked || saving}
            className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black py-3 px-8 rounded-full flex items-center shadow-lg transition-all hover:scale-105 disabled:opacity-50 text-sm"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Applying Custom Branding...' : 'Save & Apply Custom Branding'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandingView;
