// src/components/UpgradeButton.tsx

import React, { useEffect, useState } from 'react';

// Define the structure for the Razorpay window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Utility function to load an external script
const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface UpgradeButtonProps {
  planId: string;
  buttonText?: string;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({ planId, buttonText = "Upgrade to Paid Plan" }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js');
  }, []);

  const handleSubscription = async () => {
    setLoading(true);
    
    // --- THIS IS THE FIX ---
    // We are now correctly getting the token using 'access_token'
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      alert("Please log in to upgrade your plan.");
      setLoading(false);
      return;
    }

    try {
      // 1. Call your backend to create a subscription instance
      const createSubResponse = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan_id: planId }),
      });

      if (!createSubResponse.ok) {
        throw new Error('Failed to create subscription.');
      }

      const subData = await createSubResponse.json();
      const { subscription_id, key_id } = subData;

      // 2. Configure and open Razorpay Checkout
      const options = {
        key: key_id,
        subscription_id: subscription_id,
        name: 'BankConverts',
        description: 'Activate Your Subscription',
        handler: async (response: any) => {
          // 3. This handler is called after a successful payment
          const verifyResponse = await fetch('/api/verify-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          
          const verifyData = await verifyResponse.json();
          if (verifyData.status === 'success') {
            alert('Subscription activated! You can now continue using the service.');
            window.location.reload();
          } else {
            alert(`Payment verification failed: ${verifyData.message}`);
          }
        },
        prefill: {},
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Subscription Error:", error);
      alert("An error occurred during the subscription process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSubscription} disabled={loading} className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
      {loading ? 'Processing...' : buttonText}
    </button>
  );
};
