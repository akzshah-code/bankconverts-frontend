// src/components/UserTiers.tsx

import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const userTypes = [
  {
    title: 'Anonymous',
    description: 'Quick, anonymous conversions with no need to sign up.',
    pages: '1 page every 24 hours',
    price: 'Free',
    buttonText: null
  },
  {
    title: 'Registered',
    description: 'Registration is free and unlocks higher usage limits.',
    pages: '5 pages every 24 hours',
    price: 'Free',
    buttonLink: '/register',
    buttonText: 'Register'
  },
  {
    title: 'Subscribed',
    description: 'Unlimited access and all premium features.',
    pages: 'Access all features and higher limits',
    price: null,
    buttonLink: '/pricing',
    buttonText: 'View Plans'
  },
];

const UserTiers = () => {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userTypes.map((tier, index) => (
            <div
              key={tier.title}
              className={`flex flex-col p-6 rounded-lg border ${index === 2 ? 'border-blue-500 shadow-xl' : 'border-gray-200'}`}
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">{tier.title}</h3>
              <p className="mt-2 text-gray-500 text-sm min-h-[2.5rem]">{tier.description}</p>
              
              <div className="mt-4 flex items-center text-gray-600">
                {tier.pages && <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />}
                <span>{tier.pages}</span>
              </div>

              <div className="flex-grow"></div>
              
              <div className="mt-6 flex items-center justify-between">
                {tier.price && <p className="text-2xl font-bold">{tier.price}</p>}
                {tier.buttonText && tier.buttonLink && (
                  <Link to={tier.buttonLink} className={`px-4 py-2 text-sm font-semibold rounded-md ${index === 2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}>
                    {tier.buttonText} &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 p-8 rounded-lg flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div className="md:flex-grow">
                <h3 className="text-2xl font-semibold text-gray-900">Need more?</h3>
                <p className="mt-2 text-gray-600 max-w-2xl mx-auto md:mx-0">We provide bespoke services for clients who have other document formats to process. Let us know how we can help!</p>
            </div>
            <a href="mailto:support@bankconverts.com" className="mt-6 md:mt-0 md:ml-6 flex-shrink-0 px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Contact Us
            </a>
        </div>
      </div>
    </section>
  );
};

export default UserTiers;
