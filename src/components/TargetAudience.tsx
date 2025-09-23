
import { Briefcase, User, Building } from 'lucide-react';

const audience = [
  {
    icon: <Briefcase size={40} className="mb-4 text-blue-600" />,
    title: 'Accountants & CAs',
    description: 'Streamline client bookkeeping and financial audits.',
  },
  {
    icon: <Building size={40} className="mb-4 text-blue-600" />,
    title: 'Business Owners',
    description: 'Effortlessly track expenses and manage your finances.',
  },
  {
    icon: <User size={40} className="mb-4 text-blue-600" />,
    title: 'Individuals',
    description: 'Simplify your personal budgeting and tax prep.',
  },
];

const TargetAudience = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Who Is This For?</h2>
          <p className="mt-4 text-lg text-gray-600">
            Designed for professionals and individuals who value their time.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-12">
          {audience.map((person) => (
            <div key={person.title} className="bg-white p-8 rounded-lg shadow-md text-center">
              {person.icon}
              <h3 className="text-xl font-semibold">{person.title}</h3>
              <p className="mt-2 text-gray-600">{person.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;

