
// This file acts as a single source of truth for subscription plan details.
// It ensures that when a user registers for a plan, the correct usage limits
// are applied to their account.

interface PlanDetail {
  pages: number;
}

interface PlanDetails {
  [key: string]: {
    monthly: PlanDetail;
    annual: PlanDetail;
  };
}

export const PLAN_DETAILS: PlanDetails = {
  Free: {
    monthly: { pages: 5 },
    annual: { pages: 5 }, // Free plan has no annual cycle, but added for type safety.
  },
  Starter: {
    monthly: { pages: 500 },
    annual: { pages: 6000 },
  },
  Professional: {
    monthly: { pages: 1250 },
    annual: { pages: 15000 },
  },
  Business: {
    monthly: { pages: 5000 },
    annual: { pages: 60000 },
  },
};

// Helper to get plan details safely, falling back to the Free plan
export const getPlanDetails = (planName: string, billingCycle: 'monthly' | 'annual' = 'monthly') => {
  const plan = PLAN_DETAILS[planName] || PLAN_DETAILS.Free;
  return plan[billingCycle] || plan.monthly;
};
