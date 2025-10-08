// src/pages/PricingPage.tsx

import Seo from '../components/Seo'; // 1. Import the Seo component
import { useState } from 'react';
import axios from 'axios'; // 1. Import axios here

      {/* 2. Add the Seo component with page-specific content */}
      <Seo 
        title="BankConvert Pricing – Simple, Transparent Plans" 
        description="Choose the right plan for your bank statement conversion needs. BankConvert offers clear pricing with no hidden fees—built for CAs, business owners, and finance teams."
        keywords="bankconvert pricing, bank statement conversion plans, fintech pricing, CA tools"
        canonicalUrl="https://www.bankconverts.com/pricing"
      />

const pricingData = {
  monthly: [
    { tier: "Starter", price: 975, unit: "/month", pages: "500 pages / month", buttonText: "Get Started" },
    { tier: "Professional", price: 2000, unit: "/month", pages: "1,250 pages / month", buttonText: "Get Started" },
    { tier: "Business", price: 3500, unit: "/month", pages: "5,000 pages / month", buttonText: "Get Started" },
    { tier: "Enterprise", price: 0, unit: "", pages: "Custom limits and features", buttonText: "Contact Us" }
  ],
  yearly: [
    { tier: "Starter", price: 9750, unit: "/year", pages: "6,000 pages / year", buttonText: "Get Started" },
    { tier: "Professional", price: 20000, unit: "/year", pages: "15,000 pages / year", buttonText: "Get Started" },
    { tier: "Business", price: 35000, unit: "/year", pages: "60,000 pages / year", buttonText: "Get Started" },
    { tier: "Enterprise", price: 0, unit: "", pages: "Custom limits and features", buttonText: "Contact Us" }
  ]
};

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  //... (handlePayment function remains the same)
  const handlePayment = async (amount: number, tier: string) => {
    if (amount <= 0) {
      // Handle the "Contact Us" case
      window.location.href = "mailto:support@bankconverts.com";
      return;
    }
    try {
      // 1. Get the public key from our backend
      const { data: { key } } = await axios.get("/api/get-key");

      // 2. Create an order on our backend
      const { data: order } = await axios.post('/api/create-order', {
        amount: amount * 100, // Amount in paise
      });

      // 3. Set up Razorpay options
      const options = {
          key,
          amount: order.amount,
          currency: "INR",
          name: "BankConverts",
          description: `Subscription for ${tier} Plan`,
          order_id: order.id,
          handler: async function (response: any) {
              // 4. Verify the payment on our backend
              const verification = await axios.post('/api/verify-payment', {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
              });

              if (verification.data.status === 'success') {
                  alert('Payment Successful! Your subscription is active.');
                  // Here you would redirect to a dashboard or success page
              } else {
                  alert('Payment verification failed. Please contact support.');
              }
          },
          prefill: {
              // Optional: You can prefill this if the user is logged in
              name: "", 
              email: "",
              contact: "",
          },
          theme: {
              color: "#3B82F6" // Blue color
          }
      };

      // 5. Open the Razorpay checkout modal
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error("Payment error:", error);
      alert("Could not initiate payment. Please try again.");
    }
  };

  const plansToShow = billingCycle === 'monthly' ? pricingData.monthly : pricingData.yearly;

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section (remains the same) */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find the Perfect Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Start for free, then scale up as you grow. All plans include our core features.
          </p>
        </div>

        {/* --- THIS IS THE PART TO UPDATE --- */}
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
        {/* --- END OF UPDATED PART --- */}


        {/* Pricing Cards (remain the same) */}
        <div className="mt-12 grid max-w-sm mx-auto gap-8 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4">
          {plansToShow.map((plan) => (
            <div key={plan.tier} className="flex flex-col p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">{plan.tier}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price > 0 ? `₹${plan.price.toLocaleString('en-IN')}` : 'Need More?'}</span>
                {plan.unit && <span className="text-base font-medium text-gray-500">{plan.unit}</span>}
              </div>

              {/* 2. Add the onClick handler to the button */}
              <button
                onClick={() => handlePayment(plan.price, plan.tier)}
                className={`mt-6 w-full text-center px-4 py-2 font-semibold rounded-md text-white ${plan.tier === 'Enterprise' ? 'bg-gray-700 hover:bg-gray-800' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {plan.buttonText}
              </button>

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