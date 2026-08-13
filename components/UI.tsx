import React from 'react';
import { Loader2, XCircle, ArrowLeft } from 'lucide-react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="animate-spin text-indigo-400" size={48} />
  </div>
);

export const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-red-500/10 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-8 rounded-2xl border border-red-200 dark:border-red-900/30">
    <XCircle size={48} className="mb-4 text-red-600 dark:text-red-400" />
    <h3 className="text-xl font-bold">An Error Occurred</h3>
    <p className="text-sm mt-1">{message}</p>
  </div>
);

export const PageHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
    <div>{children}</div>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800/90 text-slate-900 dark:text-gray-100 rounded-2xl shadow-sm border border-slate-200/80 dark:border-gray-800 p-6 ${className}`}>
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white text-2xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="mr-3 p-2 rounded-xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
        <ArrowLeft size={18} className="text-slate-700 dark:text-gray-200" />
    </button>
);
