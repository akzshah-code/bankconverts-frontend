// src/pages/ConverterPage.tsx

import Converter from '../components/Converter'; // Import the component

const ConverterPage = () => {
  return (
    // This div centers the Converter component on the page
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <Converter />
    </div>
  );
};

export default ConverterPage;
