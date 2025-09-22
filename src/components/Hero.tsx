

const Hero = () => {
  return (
    <section className="text-center pt-32 pb-16">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
        Convert Bank Statements to <span className="text-green-600">Excel</span>
        <br />
        in <span className="text-blue-600">Seconds</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
        Stop wasting hours on manual data entry. Upload any bank statement PDF or image and get a clean, ready-to-use Excel file instantly.
      </p>
      <div className="mt-8">
        <a 
          href="/app" 
          className="text-xl font-semibold text-white bg-blue-600 px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
        >
          Convert Your First Statement Free
        </a>
      </div>
    </section>
  );
};

export default Hero;
