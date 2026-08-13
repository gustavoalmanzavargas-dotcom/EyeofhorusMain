import React, { useState } from 'react';
import { UserPlus, PlusCircle, Trash2, Key, Shield } from 'lucide-react';
import { PageHeader, Modal } from '../UI';
import { Table } from '../Table';
import { User, Role, Policy } from '../../types';
import { api } from '../../services/api';

export const UsersView: React.FC<{ data: User[]; roles: Role[]; onRefresh?: () => void }> = ({ data, roles, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', roleId: roles[0]?.id || 'r2' });

    const handleAddUser = async () => {
        await api.createUser(newUser);
        setIsModalOpen(false);
        setNewUser({ name: '', email: '', roleId: roles[0]?.id || 'r2' });
        if (onRefresh) onRefresh();
    };

    const handleDeleteUser = async (id: string) => {
        await api.deleteUser(id);
        if (onRefresh) onRefresh();
    };

    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Security Analyst';

    return (
        <div className="p-8 space-y-6">
            <PageHeader title="User Account Management">
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
                    <UserPlus size={18} className="mr-2" />Add User
                </button>
            </PageHeader>

            <Table<User> 
                headers={['Full Name', 'Email Address', 'Assigned Role', 'Actions']} 
                data={data} 
                renderRow={(user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 font-medium text-white">{user.name}</td>
                        <td className="p-3 text-gray-300 font-mono text-xs">{user.email}</td>
                        <td className="p-3">
                            <span className="px-2.5 py-1 bg-indigo-900/40 text-indigo-300 rounded text-xs font-semibold">
                                {getRoleName(user.roleId)}
                            </span>
                        </td>
                        <td className="p-3">
                            <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 hover:bg-red-950/40 text-red-400 rounded transition-colors" title="Delete User">
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                )} 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User Account">
                <div className="space-y-4">
                    <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm" />
                    <input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm" />
                    <select value={newUser.roleId} onChange={e => setNewUser({...newUser, roleId: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm">
                        {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full text-sm">Create Account</button>
                </div>
            </Modal>
        </div>
    );
};

export const RolesView: React.FC<{ data: Role[]; policies: Policy[]; onRefresh?: () => void }> = ({ data, policies, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<{name: string, description: string, policyIds: string[]}>({ name: '', description: '', policyIds: [] });

    const handleSaveRole = async () => {
        await api.createRole(currentRole);
        setIsModalOpen(false);
        setCurrentRole({ name: '', description: '', policyIds: [] });
        if (onRefresh) onRefresh();
    };

    const handlePolicyChange = (policyId: string) => {
        const policyIds = currentRole.policyIds.includes(policyId)
            ? currentRole.policyIds.filter(id => id !== policyId)
            : [...currentRole.policyIds, policyId];
        setCurrentRole({ ...currentRole, policyIds });
    };

    return (
        <div className="p-8 space-y-6">
            <PageHeader title="Role-Based Access Control (RBAC)">
                <button onClick={() => { setCurrentRole({ name: '', description: '', policyIds: [] }); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
                    <PlusCircle size={18} className="mr-2" />Add Role
                </button>
            </PageHeader>

            <Table<Role> 
                headers={['Role Name', 'Description', 'Attached Policies']} 
                data={data} 
                renderRow={(role) => (
                    <tr key={role.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 font-semibold text-white">{role.name}</td>
                        <td className="p-3 text-gray-300 text-sm">{role.description}</td>
                        <td className="p-3">
                            <span className="px-2.5 py-1 bg-indigo-900/40 text-indigo-300 rounded text-xs font-bold">
                                {role.policyIds?.length || 0} Policies Enabled
                            </span>
                        </td>
                    </tr>
                )} 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Security Role">
                <div className="space-y-4">
                    <input type="text" placeholder="Role Name" value={currentRole.name} onChange={e => setCurrentRole({...currentRole, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm" />
                    <textarea placeholder="Description" value={currentRole.description} onChange={e => setCurrentRole({...currentRole, description: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm" />
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-4">Select Attached Policies</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        {policies.map(policy => (
                            <label key={policy.id} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors">
                                <input type="checkbox" checked={currentRole.policyIds.includes(policy.id)} onChange={() => handlePolicyChange(policy.id)} className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-800 border-gray-600 rounded" />
                                <span className="text-xs text-gray-300 font-mono">{policy.id}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSaveRole} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full text-sm">Save Role</button>
                </div>
            </Modal>
        </div>
    );
};

export const PoliciesView: React.FC<{ data: Policy[]; onRefresh?: () => void }> = ({ data, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPolicy, setNewPolicy] = useState({ id: '', resource: '', description: '' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.createPolicy(newPolicy);
        setIsModalOpen(false);
        setNewPolicy({ id: '', resource: '', description: '' });
        if (onRefresh) onRefresh();
    };

    return (
        <div className="p-8 space-y-6">
            <PageHeader title="Access Control Policies">
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
                    <PlusCircle size={18} className="mr-2" />Add Policy
                </button>
            </PageHeader>

            <Table<Policy> 
                headers={['Policy ID', 'Target Resource', 'Description']} 
                data={data} 
                renderRow={(policy) => (
                    <tr key={policy.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 font-mono text-indigo-300 text-xs font-bold">{policy.id}</td>
                        <td className="p-3 text-gray-300 font-mono text-xs">{policy.resource}</td>
                        <td className="p-3 text-gray-300 text-sm">{policy.description}</td>
                    </tr>
                )} 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Security Policy">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Policy ID</label>
                        <input type="text" placeholder="e.g. p5" value={newPolicy.id} onChange={e => setNewPolicy({...newPolicy, id: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Target Resource Permission</label>
                        <input type="text" placeholder="e.g. write:system_rules" value={newPolicy.resource} onChange={e => setNewPolicy({...newPolicy, resource: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <input type="text" placeholder="e.g. Allows modifying custom rules" value={newPolicy.description} onChange={e => setNewPolicy({...newPolicy, description: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm" required />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full text-sm">Save Policy</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
