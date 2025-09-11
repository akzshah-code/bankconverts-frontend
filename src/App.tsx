

import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { User, BlogPost, EmailTemplate, EmailRoute, ConversionHistoryItem } from './lib/types';
import { users as initialUsers, blogPosts as initialBlogPosts, emailTemplates as initialEmailTemplates, emailRoutes as initialEmailRoutes } from './lib/mock-data';
import { getPlanDetails } from './lib/plans';
import { generateInvoicePdfAsBase64 } from './lib/invoice';
import { pricingData } from './components/Pricing';
import { sendWelcomeEmail, sendUpgradeEmail, sendInvoiceEmail } from './services/apiService';


// --- Lazy-loaded Page Components ---
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const BulkConvertPage = lazy(() => import('./pages/BulkConvertPage'));


const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <p className="text-lg font-semibold text-brand-dark">Loading...</p>
      <p className="text-sm text-brand-gray">Please wait a moment.</p>
    </div>
  </div>
);

function App() {
  const [route, setRoute] = useState(window.location.hash);
  
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('loggedInUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('allUsers');
      return savedUsers ? JSON.parse(savedUsers) : initialUsers;
    } catch (error) {
      console.error("Failed to parse allUsers from localStorage", error);
      return initialUsers;
    }
  });

  const [allPosts, setAllPosts] = useState<BlogPost[]>(() => {
    try {
      const savedPosts = localStorage.getItem('allPosts');
      return savedPosts ? JSON.parse(savedPosts) : initialBlogPosts;
    } catch (error) {
      console.error("Failed to parse allPosts from localStorage", error);
      return initialBlogPosts;
    }
  });

  const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>(initialEmailTemplates);
  const [allRoutes, setAllRoutes] = useState<EmailRoute[]>(initialEmailRoutes);


  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0); 
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Persist the currently logged-in user's session.
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('loggedInUser');
      }
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, [user]);

  // Persist the master user list whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
    } catch (error) {
      console.error("Failed to save allUsers to localStorage", error);
    }
  }, [allUsers]);
  
  // Persist the master blog post list whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem('allPosts', JSON.stringify(allPosts));
    } catch (error) {
      console.error("Failed to save allPosts to localStorage", error);
    }
  }, [allPosts]);


  const handleLogin = (email: string) => {
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      window.location.hash = foundUser.role === 'admin' ? '#admin' : '#dashboard';
    } else {
      const freePlanDetails = getPlanDetails('Free');
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const standardUser: User = {
        id: `usr_${Date.now()}`,
        name: 'New User',
        email: email,
        role: 'user',
        plan: 'Free',
        usage: { used: 0, total: freePlanDetails.pages },
        dailyUsage: { pagesUsed: 0, resetTimestamp: 0 },
        planRenews: 'N/A',
        planExpires: expiryDate.toISOString(),
        conversionHistory: [],
      };
      setUser(standardUser);
      setAllUsers([...allUsers, standardUser]);
      window.location.hash = '#dashboard';
    }
  };
  
  const handleRegister = (fullName: string, email: string, planName: User['plan'], billingCycle: string) => {
    const existingUser = allUsers.find(u => u.email === email);
    if (existingUser) {
      alert("An account with this email already exists. Please log in.");
      window.location.hash = '#login';
      return;
    }

    // When registering for a paid plan, create a 'Free' user first.
    // The actual upgrade happens after successful payment.
    const isPaidRegistration = planName !== 'Free';
    const initialPlan: User['plan'] = 'Free';
    const freePlanDetails = getPlanDetails(initialPlan);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: fullName,
      email: email,
      role: 'user',
      plan: initialPlan,
      usage: { used: 0, total: freePlanDetails.pages },
      dailyUsage: { pagesUsed: 0, resetTimestamp: 0 },
      planRenews: 'N/A',
      planExpires: expiryDate.toISOString(),
      conversionHistory: [],
    };

    // Asynchronously send a welcome email without blocking the registration flow.
    sendWelcomeEmail(newUser.name, newUser.email)
      .catch(emailError => {
        // Log the error for debugging but don't show it to the user.
        console.error("Failed to trigger welcome email:", emailError);
      });

    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
    
    if (isPaidRegistration) {
       // Redirect to payment, but the user state is safely 'Free' until payment succeeds.
       window.location.hash = `#pricing?autoPay=true&plan=${planName}&cycle=${billingCycle}`;
    } else {
       // For free registration, go directly to the dashboard.
       window.location.hash = '#dashboard';
    }
  };

  const handleLogout = () => {
    setUser(null);
    window.location.hash = '#login';
  };

  const handlePaymentSuccess = (planName: User['plan'], billingCycle: 'monthly' | 'annual') => {
    if (!user) {
      alert("You must be logged in to upgrade your plan.");
      window.location.hash = '#login';
      return;
    }
    
    const planDetails = getPlanDetails(planName, billingCycle);
    const updatedUser: User = {
      ...user,
      plan: planName,
      usage: { used: 0, total: planDetails.pages },
      planRenews: billingCycle === 'annual' ? '1 year from now' : '1 month from now',
      planExpires: undefined, // Remove trial expiration upon upgrading
    };

    // Asynchronously send a plan upgrade email.
    sendUpgradeEmail(updatedUser.name, updatedUser.email, updatedUser.plan)
      .catch(emailError => {
        console.error("Failed to trigger upgrade email:", emailError);
      });

    setUser(updatedUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));

    // --- Generate and Send Branded Invoice ---
    const sendInvoice = async () => {
        try {
            const planData = pricingData[billingCycle].find(p => p.name === planName);
            if (!planData) throw new Error("Could not find pricing data for invoice.");

            const pdfBase64 = await generateInvoicePdfAsBase64(updatedUser, planName, billingCycle, planData.price);

            await sendInvoiceEmail({
                name: updatedUser.name, 
                email: updatedUser.email, 
                planName: planName,
                price: planData.price,
                pdfBase64: pdfBase64,
            });
        } catch (invoiceError) {
            // Log the error for debugging but don't interrupt the user flow.
            console.error("Failed to send branded invoice:", invoiceError);
        }
    };
    sendInvoice(); // Fire-and-forget

    alert(`Upgrade successful! You are now on the ${planName} plan.`);
    window.location.hash = '#dashboard';
  };
  
  const handleConversionComplete = useCallback((items: ConversionHistoryItem[]) => {
    setUser(currentUser => {
        if (!currentUser || items.length === 0) return currentUser;

        const totalPagesUsedInBatch = items.reduce((sum, item) => sum + item.pagesUsed, 0);
        if (totalPagesUsedInBatch === 0) return currentUser;
        
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
  
        let currentDailyUsage = currentUser.dailyUsage || { pagesUsed: 0, resetTimestamp: 0 };
        if (now > currentDailyUsage.resetTimestamp) {
            currentDailyUsage = { pagesUsed: 0, resetTimestamp: now + twentyFourHours };
        }

        const updatedUser: User = {
            ...currentUser,
            usage: {
                ...currentUser.usage,
                used: (currentUser.usage.used || 0) + totalPagesUsedInBatch,
            },
            dailyUsage: {
                pagesUsed: currentDailyUsage.pagesUsed + totalPagesUsedInBatch,
                resetTimestamp: currentDailyUsage.resetTimestamp,
            },
            conversionHistory: [...(currentUser.conversionHistory || []), ...items],
        };

        setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        return updatedUser;
    });
  }, [setAllUsers]);

  const renderPage = () => {
    // --- Route Guards ---
    if (!user && (route.startsWith('#dashboard') || route.startsWith('#admin') || route.startsWith('#bulk-convert'))) {
      window.location.hash = '#login';
      return <LoadingFallback />;
    }
    if (user?.role !== 'admin' && route.startsWith('#admin')) {
      window.location.hash = '#dashboard';
      return <LoadingFallback />;
    }
    
    if (route.startsWith('#blog/')) {
      const postId = route.split('/')[1];
      return <BlogPostPage posts={allPosts} postId={postId} user={user} onLogout={handleLogout} />;
    }

    const currentRoute = route.split('?')[0];

    switch (currentRoute) {
      case '#pricing':
        return <PricingPage user={user} onLogout={handleLogout} onPaymentSuccess={handlePaymentSuccess} />;
      case '#faq':
        return <FaqPage user={user} onLogout={handleLogout} />;
      case '#terms':
        return <TermsPage user={user} onLogout={handleLogout} />;
      case '#privacy':
        return <PrivacyPolicyPage user={user} onLogout={handleLogout} />;
      case '#about':
        return <AboutPage user={user} onLogout={handleLogout} />;
      case '#contact':
        return <ContactPage user={user} onLogout={handleLogout} />;
      case '#login':
        return <LoginPage onLogin={handleLogin} />;
      case '#register':
        return <RegisterPage onRegister={handleRegister} />;
      case '#dashboard':
        return <DashboardPage user={user} onLogout={handleLogout} />;
      case '#bulk-convert':
        return <BulkConvertPage user={user} onLogout={handleLogout} onConversionComplete={handleConversionComplete} />;
      case '#blog':
        return <BlogPage posts={allPosts} user={user} onLogout={handleLogout} />;
      case '#admin':
        return (
          <AdminPage
            user={user}
            onLogout={handleLogout}
            users={allUsers}
            posts={allPosts}
            templates={allTemplates}
            routes={allRoutes}
            setUsers={setAllUsers}
            setPosts={setAllPosts}
            setTemplates={setAllTemplates}
            setRoutes={setAllRoutes}
          />
        );
      default:
        return <LandingPage user={user} onLogout={handleLogout} onConversionComplete={handleConversionComplete} />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderPage()}
    </Suspense>
  );
}

export default App;