

const faqs = [
  {
    question: 'Is my financial data secure?',
    answer:
      'Absolutely. Security is our top priority. We process your files in memory and never store them on our servers. Your data is deleted the moment you close your browser session.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'We currently support PDF, JPG, and PNG files. We are continuously working to add support for more formats.',
  },
  {
    question: 'Do you offer a free trial?',
    answer:
      'Yes! You can convert your first statement completely free to see how our tool works. No credit card is required to get started.',
  },
];

const Faq = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="border-b pb-4">
              <h3 className="font-semibold text-lg">{faq.question}</h3>
              <p className="mt-2 text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
