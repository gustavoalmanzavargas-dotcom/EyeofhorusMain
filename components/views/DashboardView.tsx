import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
  RadialBarChart, RadialBar, PolarAngleAxis 
} from 'recharts';
import { RefreshCw, Radio } from 'lucide-react';
import { Card, PageHeader } from '../UI';
import { Table } from '../Table';
import { WorldAttackMap } from '../WorldAttackMap';
import { getAlertLevelColor, MITRE_COLORS, AGENT_COLORS } from '../../constants';
import { DashboardData, Alert } from '../../types';

interface DashboardViewProps {
  data: DashboardData;
  onRefresh?: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, onRefresh }) => {
    const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return true;
    });

    React.useEffect(() => {
        const updateTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
        <div className="text-center py-2">
          <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-bold">{title}</p>
          <p className={`text-3xl font-extrabold ${color}`}>{value?.toLocaleString() || 0}</p>
        </div>
    );
    
    return (
        <div className="p-8 space-y-8">
            <PageHeader title="HORUS COMMAND — Threat Hunting & Global Security Operations">
                {onRefresh && (
                    <button 
                        onClick={onRefresh}
                        className="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700 font-bold py-2 px-4 rounded-xl flex items-center text-xs shadow-xs transition-all"
                    >
                        <RefreshCw size={14} className="mr-2" /> Refresh Dashboard Data
                    </button>
                )}
            </PageHeader>

            {/* REAL-TIME WORLD ATTACK MAP WITH LIVE THREAT INTELLIGENCE */}
            <WorldAttackMap />
            
            <Card className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-gray-800">
                <StatCard title="Total Alerts" value={data?.stats?.totalAlerts} color="text-indigo-600 dark:text-indigo-400" />
                <StatCard title="Critical (Lvl 12+)" value={data?.stats?.level12Alerts} color="text-red-600 dark:text-red-400" />
                <StatCard title="Auth Failures" value={data?.stats?.authFailure} color="text-amber-600 dark:text-orange-300" />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Alerts Level Evolution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data?.alertsEvolution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="dark:stroke-gray-800" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                                    borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                                    color: isDarkMode ? '#fff' : '#0f172a', 
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }} 
                                itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#4f46e5' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">MITRE ATT&CK Framework</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadialBarChart 
                            cx="50%" 
                            cy="50%" 
                            innerRadius="30%" 
                            outerRadius="100%" 
                            barSize={20} 
                            data={data?.mitreAttck}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar background={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }} dataKey='value' angleAxisId={0} cornerRadius={10}>
                                {data?.mitreAttck?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={MITRE_COLORS[index % MITRE_COLORS.length]} />
                                ))}
                            </RadialBar>
                            <Legend 
                                iconSize={10} 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right" 
                                wrapperStyle={{ color: '#64748b', fontSize: '12px' }}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top 5 Agents by Volume</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie 
                                data={data?.topAgents} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={80} 
                                outerRadius={120} 
                                paddingAngle={5}
                                stroke="none"
                            >
                                {data?.topAgents?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={AGENT_COLORS[index % AGENT_COLORS.length]} />
                                ))}
                            </Pie>
                             <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{color: '#64748b', fontSize: '12px'}} />
                             <Tooltip contentStyle={{ 
                                 backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                                 borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                                 color: isDarkMode ? '#fff' : '#0f172a', 
                                 borderRadius: '12px',
                                 boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                             }} itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Agents Activity Evolution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.topAgentsEvolution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="dark:stroke-gray-800" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                            <Tooltip contentStyle={{ 
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                                borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                                color: isDarkMode ? '#fff' : '#0f172a', 
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }} itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a' }} cursor={{fill: isDarkMode ? '#334155' : '#cbd5e1', opacity: 0.4}} />
                            <Legend wrapperStyle={{color: '#64748b', fontSize: '12px', paddingTop: '10px'}} />
                             {data?.topAgents?.map((agent, index) => (
                                <Bar key={agent.name} dataKey={agent.name} stackId="a" fill={AGENT_COLORS[index % AGENT_COLORS.length]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">Latest Security Alerts</h3>
                </div>
                <Table<Alert> 
                    headers={['Time', 'Agent', 'Agent name', 'Technique', 'Tactic', 'Description', 'Level', 'Rule ID']}
                    data={data?.securityAlerts || []}
                    renderRow={(alert) => (
                        <tr key={alert.id} className="border-b border-slate-100 dark:border-gray-800/80 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="p-3 whitespace-nowrap text-slate-500 dark:text-gray-400 text-xs">{alert.time}</td>
                            <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold font-mono text-xs">{alert.agentId}</td>
                            <td className="p-3 font-semibold text-slate-900 dark:text-gray-200">{alert.agentName || alert.agent}</td>
                            <td className="p-3 text-indigo-600 dark:text-indigo-300 font-mono text-xs">{alert.technique}</td>
                            <td className="p-3 text-slate-700 dark:text-gray-300">{alert.tactic}</td>
                            <td className="p-3 max-w-xs truncate text-slate-700 dark:text-gray-200" title={alert.description}>{alert.description}</td>
                            <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${getAlertLevelColor(alert.level)}`}>{alert.level}</span></td>
                            <td className="p-3 font-mono text-slate-500 dark:text-gray-400 text-xs">{alert.ruleId}</td>
                        </tr>
                    )}
                />
            </Card>
        </div>
    );
};

export default DashboardView;
