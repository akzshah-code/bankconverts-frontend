
import { UploadCloud, Bot, DownloadCloud } from 'lucide-react';

const steps = [
  {
    icon: <UploadCloud size={48} className="text-blue-600 mb-4" />,
    title: '1. Upload',
    description: 'Upload your PDF or image file.',
  },
  {
    icon: <Bot size={48} className="text-blue-600 mb-4" />,
    title: '2. Process',
    description: 'Our secure AI extracts the data in seconds.',
  },
  {
    icon: <DownloadCloud size={48} className="text-blue-600 mb-4" />,
    title: '3. Download',
    description: 'Download your perfectly formatted Excel file.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get your bank statements into Excel in three simple steps.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step) => (
            <div key={step.title} className="text-center">
              {step.icon}
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
