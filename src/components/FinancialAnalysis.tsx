

import { FinancialAnalysis } from '../lib/types';
import BarChart from './charts/BarChart';

interface FinancialAnalysisProps {
  analysis: FinancialAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSkeleton = () => (
    <div className="my-8 animate-fade-in space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div> {/* Title skeleton */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Insights Card Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
            </div>

            {/* Subscriptions Card Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        </div>

        {/* Chart Card Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div> {/* Chart placeholder */}
        </div>
    </div>
);


const FinancialAnalysisComponent = ({ analysis, isLoading, error }: FinancialAnalysisProps) => {
    if (isLoading) {
        return <LoadingSkeleton />;
    }
    
    if (error) {
        return (
            <div className="my-8 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                <p className="font-semibold">Could not generate analysis.</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!analysis) {
        return null;
    }
    
    // Prepare data for the bar chart, taking the top 5 categories
    const chartData = analysis.spendingByCategory
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map(item => ({
            label: item.category,
            value: item.totalAmount
        }));
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="my-8 animate-fade-in space-y-8">
            <h3 className="text-2xl font-bold text-brand-dark text-center">AI-Powered Financial Insights</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Insights */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h4 className="font-bold text-lg text-brand-dark mb-3">Key Insights</h4>
                    <ul className="space-y-2 list-disc list-inside text-brand-gray">
                        {analysis.summary.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Recurring Subscriptions */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h4 className="font-bold text-lg text-brand-dark mb-3">Recurring Subscriptions</h4>
                    {analysis.recurringSubscriptions.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {analysis.recurringSubscriptions.map((item, index) => (
                                <li key={index} className="py-2 flex justify-between items-center">
                                    <span className="text-brand-dark">{item.name}</span>
                                    <span className="font-semibold text-brand-dark">{formatCurrency(item.estimatedAmount)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-brand-gray">No recurring subscriptions detected.</p>
                    )}
                </div>
            </div>

            {/* Spending Breakdown */}
            {chartData.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h4 className="font-bold text-lg text-brand-dark mb-4 text-center">Top Spending Categories</h4>
                    <BarChart data={chartData} />
                </div>
            )}
        </div>
    );
};

export default FinancialAnalysisComponent;