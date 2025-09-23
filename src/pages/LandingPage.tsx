
import Hero from '../components/Hero'; // Your existing Hero component
import UserTiers from '../components/UserTiers'; // 1. Import the new component
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import TargetAudience from '../components/TargetAudience';
import Faq from '../components/Faq';


const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800"> 
        <Hero />
        <main>
        <UserTiers />
        <HowItWorks />
        <Features />
        <TargetAudience />
        <Faq />
      </main>
    </div>
  );
};

export default LandingPage;
