import React from 'react';
import { PageHeader } from '../UI';

interface PlaceholderViewProps {
  title: string;
  icon: React.ReactNode;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon }) => (
    <div className="p-8">
        <PageHeader title={title} />
        <div className="flex flex-col items-center justify-center h-[500px] bg-gray-800 rounded-xl border border-gray-700 shadow-inner">
            <div className="p-6 bg-gray-700/50 rounded-full mb-6">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400 max-w-md text-center">This feature is currently under development. Check back later for updates to the {title} module.</p>
        </div>
    </div>
);

export default PlaceholderView;
