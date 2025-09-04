import type { FC } from 'react';
import { User } from '../lib/types';

interface LimitReachedViewProps {
  message: string;
  user: User | null;
}

const LimitReachedView: FC<LimitReachedViewProps> = ({ message, user }) => {
  const showUpgradeButton = user && user.plan;

  return (
    <div className="border-2 border-dashed border-red-300 rounded-lg p-8 text-center bg-red-50/50 h-64 flex flex-col items-center justify-center space-y-4 animate-fade-in">
      <div className="bg-red-100 rounded-full p-3">
        <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-red-600">Upload Limit Reached</h3>
      <p className="text-sm text-red-500 max-w-sm">{message}</p>
      {showUpgradeButton && (
        <a 
          href="#pricing" 
          className="mt-2 bg-brand-blue text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-brand-blue-hover transition-colors"
        >
          {user?.plan === 'Free' ? 'Upgrade for More Pages' : 'Upgrade Plan'}
        </a>
      )}
      {!user && (
        <a 
          href="#register" 
          className="mt-2 bg-brand-primary text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
        >
          Register for Free
        </a>
      )}
    </div>
  );
};

export default LimitReachedView;
