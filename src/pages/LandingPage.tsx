

import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import BankSupport from '../components/BankSupport';
import UsageTiers from '../components/UsageTiers';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import { User, ConversionHistoryItem } from '../lib/types';
import { updateAnonymousUsage } from '../lib/usage';

interface LandingPageProps {
  user: User | null;
  onLogout: () => void;
  onConversionComplete: (items: ConversionHistoryItem[]) => void;
}

const LandingPage = ({ user, onLogout, onConversionComplete }: LandingPageProps) => {
  const handleLandingConversion = (items: ConversionHistoryItem[]) => {
    if (!user) {
      const totalPages = items.reduce((sum, item) => sum + item.pagesUsed, 0);
      updateAnonymousUsage(totalPages);
    }
    // This will update state for logged-in users via App.tsx
    onConversionComplete(items);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-grow">
        <Hero onConversionComplete={handleLandingConversion} user={user} />
        <Features />
        <BankSupport />
        <UsageTiers />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;