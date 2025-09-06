

import { User } from "../lib/types";
import { StatCard } from './shared/StatCard';
import { ChartCard } from './shared/ChartCard';
import DonutChart from './charts/DonutChart';
import ConversionHistory from './ConversionHistory';


const TrialBanner = ({ expiryDate }: { expiryDate: string }) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    // Set hours to 0 to compare dates only
    now.setHours(0, 0, 0, 0);
    expiry.setHours(23, 59, 59, 999);
    
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8 animate-fade-in" role="alert">
                <p className="font-bold">Free Trial Expired</p>
                <p>Your 7-day free trial has expired. The free plan is non-renewable. Please <a href="#pricing" className="font-semibold underline">upgrade your plan</a> to continue converting documents.</p>
            </div>
        );
    }

    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-8 animate-fade-in" role="alert">
            <p className="font-bold">Free Trial Information</p>
            <p>Your free registered account is valid for <strong>{diffDays} day{diffDays !== 1 ? 's' : ''}</strong>. <a href="#pricing" className="font-semibold underline">Upgrade now</a> to increase your limits.</p>
        </div>
    );
};


const Dashboard = ({ user }: {user: User | null}) => {
    if (!user) {
        return (
            <div className="text-center">
                <h1 className="text-3xl font-bold text-brand-dark">Error</h1>
                <p className="text-brand-gray mt-1">User not found. Please log in again.</p>
            </div>
        );
    }
    
    const monthlyUsagePercent = user.usage.total > 0 ? (user.usage.used / user.usage.total) * 100 : 0;
    const dailyUsagePercent = user.plan === 'Free' ? (user.dailyUsage.pagesUsed / 5) * 100 : 0;
    const isTrialExpired = user.plan === 'Free' && user.planExpires && new Date().getTime() > new Date(user.planExpires).getTime();

    return (
        <div className="space-y-8">
            {user.plan === 'Free' && user.planExpires && <TrialBanner expiryDate={user.planExpires} />}
            
            <div className="text-left">
                <h1 className="text-3xl font-bold text-brand-dark">Welcome, {user.name}!</h1>
                <p className="text-brand-gray mt-1">Here's a summary of your account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Current Plan"
                    value={user.plan}
                >
                    <p className="text-xs text-brand-gray">Renews: {user.planRenews}</p>
                </StatCard>
                <ChartCard title="Monthly Page Usage">
                    <DonutChart percentage={monthlyUsagePercent} label={`${user.usage.used} / ${user.usage.total}`} />
                </ChartCard>
                 {user.plan === 'Free' && (
                    <ChartCard title="Daily Page Usage">
                        <DonutChart percentage={dailyUsagePercent} label={`${user.dailyUsage.pagesUsed} / 5`} />
                    </ChartCard>
                 )}
            </div>

            <div>
                <ConversionHistory history={user.conversionHistory || []} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isTrialExpired ? (
                        <div className="block p-4 bg-gray-200 text-center rounded-lg opacity-60 cursor-not-allowed" aria-disabled="true">
                            <span className="font-semibold text-brand-gray">Bulk Convert</span>
                            <p className="text-xs text-brand-gray">Process multiple files at once</p>
                        </div>
                    ) : (
                        <a href="#bulk-convert" className="block p-4 bg-brand-blue-light text-center rounded-lg hover:bg-blue-200 transition-colors">
                            <span className="font-semibold text-brand-blue">Bulk Convert</span>
                            <p className="text-xs text-brand-gray">Process multiple files at once</p>
                        </a>
                    )}
                     <a href="#pricing" className="block p-4 bg-brand-blue-light text-center rounded-lg hover:bg-blue-200 transition-colors">
                        <span className="font-semibold text-brand-blue">Upgrade Plan</span>
                        <p className="text-xs text-brand-gray">Get more pages and features</p>
                    </a>
                     <a href="#faq" className="block p-4 bg-brand-blue-light text-center rounded-lg hover:bg-blue-200 transition-colors">
                        <span className="font-semibold text-brand-blue">View FAQ</span>
                        <p className="text-xs text-brand-gray">Find answers to common questions</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;