import React from 'react';

// You can find icons from libraries like heroicons.com
const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.JSX.Element }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <div className="flex justify-center items-center h-12 w-12 rounded-full bg-blue-100 mx-auto">
      {icon}
    </div>
    <h3 className="mt-5 text-xl font-bold text-gray-900">{title}</h3>
    <p className="mt-2 text-base text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      title: 'AI-Powered Accuracy',
      description: 'Our advanced AI extracts tables and data with industry-leading precision, handling complex layouts with ease.',
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.373 3.373 0 0014 18.469V19a2 2 0 11-4 0v-.531A3.373 3.373 0 009.075 17l-.548-.547z" /></svg>
    },
    {
      title: 'Secure and Private',
      description: 'Your privacy is our priority. Files are processed in memory and never stored on our servers.',
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6.364-3.636l-1.414-1.414M20.778 13.222l-1.414-1.414M6.343 6.343l-1.414 1.414M17.657 6.343l1.414 1.414M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
    },
    {
      title: 'Batch Conversion',
      description: 'Save even more time by uploading and converting multiple bank statements in a single, powerful operation.',
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6M12 17V7M4 17h16a1 1 0 001-1V8a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1z" /></svg>
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">Everything You Need, Nothing You Don't</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
        </div>
      </div>
    </section>
  );
};

export default Features;
