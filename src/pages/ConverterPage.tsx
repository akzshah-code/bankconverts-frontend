// src/pages/ConverterPage.tsx

import Converter from '../components/Converter'; // Make sure this path is correct

const ConverterPage = () => {
  return (
    // This div is responsible for centering the component
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <Converter />
    </div>
  );
};

export default ConverterPage;
