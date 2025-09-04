
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import BankSupport from '../components/BankSupport';
import UsageTiers from '../components/UsageTiers';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import { User, ConversionResult } from '../lib/types';
import { updateAnonymousUsage } from '../lib/usage';

interface LandingPageProps {
  user: User | null;
  onLogout: () => void;
  onConversionComplete: (result: ConversionResult) => void;
}

const LandingPage = ({ user, onLogout, onConversionComplete }: LandingPageProps) => {
  const handleLandingConversion = (result: ConversionResult) => {
    if (!user) {
      updateAnonymousUsage(result.pages);
    }
    // This will update state for logged-in users via App.tsx
    onConversionComplete(result);
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
