// src/pages/LandingPage.tsx

import Seo from '../components/Seo'; // 1. Import the Seo component
import Hero from '../components/Hero';
import UserTiers from '../components/UserTiers';
import BanksAndPricing from '../components/BanksAndPricing';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import TargetAudience from '../components/TargetAudience';
import Faq from '../components/Faq';

const LandingPage = () => {
  return (
    <>
      {/* 2. Add the Seo component with page-specific content */}
      <Seo 
        title="Instant Bank Statement to Excel Converter" 
        description="Convert any bank statement (PDF or image) to a clean Excel file in seconds. Save hours of manual data entry with our secure and accurate tool."
        keywords="bank statement converter, pdf to excel, bank statement to excel, convert bank statement"
        canonicalUrl="https://www.bankconverts.com"
      />

      <div className="bg-white text-gray-800"> 
        <Hero />
        <main>
          <UserTiers />
          <BanksAndPricing />
          <HowItWorks />
          <Features />
          <TargetAudience />
          <Faq />
        </main>
      </div>
    </>
  );
};

export default LandingPage;
