
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
// Import other components like HowItWorks, FAQ, Footer as you create them

const LandingPage = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        {/* You can add more sections here */}
        {/* <HowItWorks /> */}
        {/* <FAQ /> */}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;
