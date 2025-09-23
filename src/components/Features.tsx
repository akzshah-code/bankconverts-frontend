
import { FileType, ShieldCheck, Zap, Layers } from 'lucide-react';

const features = [
  {
    icon: <FileType className="h-6 w-6" />,
    name: 'Multiple Formats',
    description: 'Supports PDF, JPG, and PNG. We handle the rest.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    name: 'High Accuracy',
    description: 'AI-powered for precise data extraction, saving you from errors.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    name: 'Secure & Private',
    description: 'Your data is processed and never stored on our servers.',
  },
  {
    icon: <Layers className="h-6 w-6" />,
    name: 'Batch Processing',
    description: 'Save time by converting multiple statements at once.',
  },
];

const Features = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight sm:text-4xl">
            Everything You Need, Nothing You Don't
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our tool is designed to be powerful yet simple, focusing on what matters most.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Features;

