import Header from '../components/Header';
import Hero from '../components/Hero'; // Your existing Hero component
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import TargetAudience from '../components/TargetAudience';
import Faq from '../components/Faq';
import Footer from '../components/Footer'; // Assuming you have a Footer component

const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800">
      <Header />
      <main>
      <Hero />
        <HowItWorks />
        <Features />
        <TargetAudience />
        <Faq />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
