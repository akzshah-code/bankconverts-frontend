// src/components/Hero.tsx

const Hero = () => {
  return (
    <section className="text-center px-4 pt-20 pb-12 md:pt-32 md:pb-16">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
        Convert <span className="text-blue-600"> Bank Statements </span> to <span className="text-green-600">Excel</span>
        <br />
        in Seconds
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-gray-600">
        Stop wasting hours on manual data entry. Upload any bank statement PDF or image and get a clean, ready-to-use Excel file instantly.
      </p>
      <div className="mt-8">
        <a 
          href="/app" 
          className="text-lg font-semibold text-white bg-blue-600 px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all md:text-xl md:px-8 md:py-4"
        >
          Convert Your First Statement Free
        </a>
      </div>
    </section>
  );
};

export default Hero;
