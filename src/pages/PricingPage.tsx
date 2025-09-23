import { useState } from 'react';

// Data for our pricing plans
const pricingData = {
  monthly: [
    { tier: "Starter", price: "₹975", unit: "/month", pages: "500 pages / month", buttonText: "Get Started" },
    { tier: "Professional", price: "₹2,000", unit: "/month", pages: "1,250 pages / month", buttonText: "Get Started" },
    { tier: "Business", price: "₹3,500", unit: "/month", pages: "5,000 pages / month", buttonText: "Get Started" },
    { tier: "Enterprise", price: "Need More?", unit: "", pages: "Custom limits and features", buttonText: "Contact Us" }
  ],
  yearly: [
    { tier: "Starter", price: "₹9,750", unit: "/year", pages: "6,000 pages / year", buttonText: "Get Started" },
    { tier: "Professional", price: "₹20,000", unit: "/year", pages: "15,000 pages / year", buttonText: "Get Started" },
    { tier: "Business", price: "₹35,000", unit: "/year", pages: "60,000 pages / year", buttonText: "Get Started" },
    { tier: "Enterprise", price: "Need More?", unit: "", pages: "Custom limits and features", buttonText: "Contact Us" }
  ]
};


const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plansToShow = billingCycle === 'monthly' ? pricingData.monthly : pricingData.yearly;

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find the Perfect Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Start for free, then scale up as you grow. All plans include our core features.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="mt-10 flex justify-center items-center">
          <div className="relative flex items-center bg-gray-200 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`w-24 py-2 text-sm font-semibold rounded-full focus:outline-none transition-colors duration-300 ${billingCycle === 'monthly' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`w-24 py-2 text-sm font-semibold rounded-full focus:outline-none transition-colors duration-300 ${billingCycle === 'yearly' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'}`}
            >
              Yearly
            </button>
          </div>
          <span className="ml-4 relative">
             <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                Get 2 Months Free!
             </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid max-w-sm mx-auto gap-8 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4">
          {plansToShow.map((plan) => (
            <div key={plan.tier} className="flex flex-col p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">{plan.tier}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.unit && <span className="text-base font-medium text-gray-500">{plan.unit}</span>}
              </div>
              <a href="#" className={`mt-6 w-full text-center px-4 py-2 font-semibold rounded-md text-white ${plan.tier === 'Enterprise' ? 'bg-gray-700 hover:bg-gray-800' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {plan.buttonText}
              </a>
              <p className="mt-6 text-sm text-gray-500 flex items-center">
                {plan.pages && (
                    <>
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {plan.pages}
                    </>
                )}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PricingPage;
