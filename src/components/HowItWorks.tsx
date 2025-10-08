// src/components/HowItWorks.tsx

import UploadIcon from '../assets/upload-icon.svg';
import ProcessingIcon from '../assets/processing-icon.svg';
import DownloadIcon from '../assets/download-icon.svg';

const steps = [
  {
    icon: <img src={UploadIcon} alt="Upload your file" className="h-12 w-12 mx-auto mb-4" />,
    title: '1. Upload',
    description: 'Drag and drop or select your PDF or image file.',
  },
  {
    icon: <img src={ProcessingIcon} alt="Processing your file" className="h-12 w-12 mx-auto mb-4" />,
    title: '2. Process',
    description: 'Our secure AI extracts the data in seconds.',
  },
  {
    icon: <img src={DownloadIcon} alt="Download your file" className="h-12 w-12 mx-auto mb-4" />,
    title: '3. Download',
    description: 'Download your perfectly formatted Excel file.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get your bank statements into Excel in three simple steps.
          </p>
        </div>
        <div className="mt-16 grid gap-12 sm:grid-cols-1 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              {step.icon}
              <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-base text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

