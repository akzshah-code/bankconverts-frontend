// src/pages/HomePage.tsx

import Seo from '../components/Seo';
import Converter from '../components/Converter'; // Import the new component

// Placeholder components for other sections (you can create these files later)
const Features = () => (
  <div className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-3xl font-bold">Why Choose BankConverts?</h2>
      {/* Feature list would go here */}
    </div>
  </div>
);

const Testimonials = () => (
  <div className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-3xl font-bold">Trusted by Professionals</h2>
      {/* Testimonial cards would go here */}
    </div>
  </div>
);

const HomePage = () => {
  return (
    <>
      <Seo 
        title="BankConverts | The #1 Bank Statement Converter"
        description="Instantly convert any bank statement (PDF, Scanned Image) to Excel. Secure, fast, and 99% accurate. Trusted by CAs and businesses in India."
      />

      {/* Hero Section */}
      <div className="bg-gray-50 pt-24 pb-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900">
            Transform Statements. Unlock Data.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            The fastest and most accurate way to convert bank statements to Excel.
          </p>
        </div>
      </div>

      {/* Converter Component */}
      <Converter />

      {/* Other Sections */}
      <Features />
      <Testimonials />
    </>
  );
};

export default HomePage;
