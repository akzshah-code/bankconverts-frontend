import { User } from './types';

interface AnonymousUsage {
    pagesUsed: number;
    resetTimestamp: number;
}

export const checkUsageLimit = (user: User | null): { limitReached: boolean, message: string } => {
    const now = Date.now();
    
    // Case 1: Anonymous User (1 page / 24 hours)
    if (!user) {
        const usageData = localStorage.getItem('anonymousUsage');
        if (usageData) {
            try {
                const usage: AnonymousUsage = JSON.parse(usageData);
                if (now < usage.resetTimestamp && usage.pagesUsed >= 1) {
                    return {
                        limitReached: true,
                        message: `You have used your free anonymous upload for today. Please register to convert more pages or wait until your limit resets.`
                    };
                }
            } catch (e) {
                console.error("Failed to parse anonymous usage data", e);
                localStorage.removeItem('anonymousUsage');
            }
        }
        return { limitReached: false, message: '' };
    }

    // Case 2: Registered Free User (7-day trial, then upgrade required)
    if (user.plan === 'Free') {
        // First, check if the trial period has expired. This is the most restrictive rule.
        if (user.planExpires && now > new Date(user.planExpires).getTime()) {
            return {
                limitReached: true,
                message: "Your 7-day free trial has expired and is non-renewable. Please upgrade your plan to continue converting documents."
            };
        }

        // If the trial is still active, check the daily usage limit.
        const dailyUsage = user.dailyUsage || { pagesUsed: 0, resetTimestamp: 0 };
        if (now < dailyUsage.resetTimestamp && dailyUsage.pagesUsed >= 5) {
             const resetTime = new Date(dailyUsage.resetTimestamp).toLocaleString();
             return {
                limitReached: true,
                message: `You've reached your daily limit of 5 pages. Your limit resets on ${resetTime}. Please upgrade to convert more.`
             };
        }
    }
    
    // Case 3: Paid User (monthly/annual limit)
    if (user.usage.used >= user.usage.total) {
        return {
            limitReached: true,
            message: `You have used all ${user.usage.total} pages for your current billing cycle. Please upgrade your plan to continue.`
        };
    }

    return { limitReached: false, message: '' };
};

export const updateAnonymousUsage = (pages: number) => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const usageData = localStorage.getItem('anonymousUsage');
    let currentUsage: AnonymousUsage = { pagesUsed: 0, resetTimestamp: 0 };

    if (usageData) {
        try {
            currentUsage = JSON.parse(usageData);
        } catch (e) {
             console.error("Failed to parse anonymous usage data", e);
             localStorage.removeItem('anonymousUsage');
        }
    }
    
    if (now > currentUsage.resetTimestamp) {
        // If the reset timestamp has passed, create a new cycle.
        currentUsage = { pagesUsed: 0, resetTimestamp: now + twentyFourHours };
    }

    currentUsage.pagesUsed += pages;
    localStorage.setItem('anonymousUsage', JSON.stringify(currentUsage));
}