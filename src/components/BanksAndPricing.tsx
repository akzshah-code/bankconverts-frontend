// src/components/BanksAndPricing.tsx


// Reusable component for bank logos
const BankLogo: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  // Using <img> tag directly as SVGs might not render well with grayscale filter in all browsers.
  // Using a class to control height ensures consistency.
  <img src={src} alt={alt} className="h-8 md:h-9 object-contain filter grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300" />
);

// Reusable component for pricing cards
interface PricingCardProps {
  plan: string;
  description: string;
  price: string;
  features: string[];
  isFeatured?: boolean;
  actionText: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, description, price, features, isFeatured, actionText }) => (
  <div className={`border rounded-2xl p-8 flex flex-col ${isFeatured ? 'border-blue-500 border-2 bg-white' : 'border-gray-200 bg-white'}`}>
    <h3 className="text-xl font-bold text-gray-800">{plan}</h3>
    <p className="text-sm text-gray-500 mt-1 h-10">{description}</p>
    <div className="mt-6">
        {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-gray-600">{feature}</span>
            </div>
        ))}
    </div>
    <div className="flex-grow"></div>
    <div className="mt-8 flex items-center justify-between">
      <p className="text-2xl font-bold text-gray-900">{price}</p>
      {actionText && <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">{actionText}</a>}
    </div>
  </div>
);


const BanksAndPricing: React.FC = () => {
  // Array of bank logos provided by you
  const bankLogos = [
    { alt: 'HDFC Bank Logo', src: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg' },
    { alt: 'ICICI Bank Logo', src: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg' },
    { alt: 'State Bank of India Logo', src: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg' },
    { alt: 'Axis Bank Logo', src: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg' },
    { alt: 'Yes Bank Logo', src: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Yes_Bank_SVG_Logo.svg' },
    { alt: 'IDFC First Bank Logo', src: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_of_IDFC_First_Bank.svg' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Built for Indian Banks</h2>
          <p className="mt-3 text-lg text-gray-600">Supports all major Indian bank formats with more added every month.</p>
        </div>

        {/* Mapped over the bankLogos array */}
        <div className="mt-12 flex justify-center items-center flex-wrap gap-x-12 sm:gap-x-16 gap-y-8">
          {bankLogos.map((logo) => (
            <BankLogo key={logo.alt} src={logo.src} alt={logo.alt} />
          ))}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard plan="Anonymous" description="Anonymous conversions with no need to sign up" price="Free" features={["1 page every 24 hours"]} actionText="" />
          <PricingCard plan="Registered" description="Registration is free" price="Free" features={["5 pages every 24 hours"]} actionText="Register" />
          <PricingCard plan="Subscribe" description="Subscribe to convert more documents" price="" features={[]} actionText="Register" isFeatured={true} />
        </div>
      </div>
    </section>
  );
};

export default BanksAndPricing;