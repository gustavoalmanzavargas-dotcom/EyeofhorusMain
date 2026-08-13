// Chart Colors
export const MITRE_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];
export const AGENT_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

// Helper Functions
export const getAlertLevelColor = (level: number): string => {
  if (level >= 12) return 'bg-red-500 text-white';
  if (level >= 8) return 'bg-orange-500 text-white';
  if (level >= 5) return 'bg-yellow-400 text-black';
  return 'bg-gray-500 text-white';
};

export const getAgentStatusColor = (status: string): string => {
    if (status === 'Isolated') return 'bg-red-500/20 text-red-600 dark:text-red-400 font-black border border-red-500/40 animate-pulse';
    if (status === 'Active') return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold';
    if (status === 'Disconnected') return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold';
    return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 font-bold';
};

export const getSeverityColor = (severity: string): string => {
    switch(severity) {
        case 'CRITICAL': return 'bg-red-500/80 text-white';
        case 'HIGH': return 'bg-orange-500/80 text-white';
        case 'MEDIUM': return 'bg-yellow-400/80 text-black';
        default: return 'bg-blue-500/80 text-white';
    }
};
