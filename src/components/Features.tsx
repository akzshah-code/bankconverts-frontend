// src/components/Features.tsx

import { FileType, ShieldCheck, Zap, Layers } from 'lucide-react';

const features = [
  {
    icon: <FileType className="h-6 w-6 text-white" />,
    name: 'Multiple Formats',
    description: 'Supports PDF, JPG, and PNG. We handle the rest.',
  },
  {
    icon: <Zap className="h-6 w-6 text-white" />,
    name: 'High Accuracy',
    description: 'AI-powered for precise data extraction, saving you from errors.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-white" />,
    name: 'Secure & Private',
    description: 'Your data is processed securely and never stored.',
  },
  {
    icon: <Layers className="h-6 w-6 text-white" />,
    name: 'Batch Processing',
    description: 'Save time by converting multiple statements at once (coming soon).',
  },
];

const Features = () => {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need, Nothing You Don't
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our tool is designed to be powerful yet simple, focusing on what matters most.
          </p>
        </div>

        <div className="mt-12">
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-lg leading-6 font-medium text-gray-900">{feature.name}</dt>
                  <dd className="mt-2 text-base text-gray-500">{feature.description}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Features;