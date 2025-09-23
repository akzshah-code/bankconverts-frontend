import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const userTypes = [
  {
    title: 'Anonymous',
    description: 'Anonymous conversions with no need to sign up',
    pages: '1 page every 24 hours',
    price: 'Free',
    buttonText: null // No button for this tier
  },
  {
    title: 'Registered',
    description: 'Registration is free',
    pages: '5 pages every 24 hours',
    price: 'Free',
    buttonLink: '/register',
    buttonText: 'Register'
  },
  {
    title: 'Subscribe',
    description: 'Subscribe to convert more documents',
    pages: 'Access all features and higher limits',
    price: null, // Price is on the pricing page
    buttonLink: '/pricing',
    buttonText: 'View Plans'
  },
];

const UserTiers = () => {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userTypes.map((tier, index) => (
            <div
              key={tier.title}
              className={`flex flex-col p-6 rounded-lg border ${index === 2 ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
            >
              <h3 className="text-2xl font-semibold text-gray-900">{tier.title}</h3>
              <p className="mt-2 text-gray-500 text-sm h-10">{tier.description}</p>
              
              <div className="mt-4 flex items-center text-gray-600">
                {tier.pages && <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />}
                <span>{tier.pages}</span>
              </div>

              <div className="flex-grow"></div> {/* Pushes content below to the bottom */}
              
              <div className="mt-6 flex items-center justify-between">
                {tier.price && <p className="text-2xl font-bold">{tier.price}</p>}
                {tier.buttonText && (
                  <Link to={tier.buttonLink!} className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    {tier.buttonText} &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* "Need More?" Section */}
        <div className="mt-16 bg-blue-50 p-8 rounded-lg flex flex-col md:flex-row items-center justify-between">
            <div>
                <h3 className="text-2xl font-semibold text-gray-900">Need more?</h3>
                <p className="mt-2 text-gray-600 max-w-2xl">We provide bespoke services for clients who have other document formats to process. Let us know how we can help!</p>
            </div>
            <a href="mailto:support@bankconverts.com" className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Contact Us
            </a>
        </div>
      </div>
    </section>
  );
};

export default UserTiers;
