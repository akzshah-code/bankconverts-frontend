import React from 'react';

const TermsPage = (): React.JSX.Element => {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </header>

          <div className="text-gray-700 space-y-6">
            <p>
              Welcome to BankConverts.com ("BankConverts", "we", "us", or "our"). These Terms of Service ("Terms") govern your use of our website and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>

            <h2 className="text-2xl font-semibold pt-4">1. Acceptance of Terms</h2>
            <p>
              By creating an account, uploading files, or otherwise using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.
            </p>

            <h2 className="text-2xl font-semibold pt-4">2. Description of Service</h2>
            <p>
              BankConverts provides a tool to convert bank statements from various formats (such as PDF and images) into structured data formats like Excel (XLSX) and CSV. The conversion process is powered by artificial intelligence and is designed to happen entirely within your browser to protect your privacy.
            </p>

            <h2 className="text-2xl font-semibold pt-4">3. User Conduct and Responsibilities</h2>
            <p>You agree not to use the Service for any unlawful purpose or in any way that could harm, disable, or impair the Service. You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Ensuring you have the legal right to upload and process any documents you submit.</li>
              <li>Maintaining the confidentiality of your account credentials, if applicable.</li>
              <li>Complying with all applicable laws and regulations regarding your use of the Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-4">4. Data Privacy and Security</h2>
            <p>
              We prioritize your privacy. All file processing, including for password-protected documents, is performed client-side in your web browser. Your files are not uploaded to or stored on our servers. Please review our Privacy Policy for a detailed explanation of our data practices.
            </p>
            
            <h2 className="text-2xl font-semibold pt-4">5. Intellectual Property</h2>
            <p>
              All content and materials available on the Service, including but not limited to text, graphics, website name, code, images, and logos, are the intellectual property of BankConverts and are protected by applicable copyright and trademark law. You may not copy, reproduce, or distribute any content from the Service without our express written permission.
            </p>

            <h2 className="text-2xl font-semibold pt-4">6. Disclaimers</h2>
            <p>
              The Service is provided on an "as is" and "as available" basis. While we strive for high accuracy, we do not warrant that the data extracted will be 100% accurate or error-free. You are responsible for verifying the accuracy of the converted data before use. We disclaim all warranties, express or implied, including the warranty of merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <h2 className="text-2xl font-semibold pt-4">7. Limitation of Liability</h2>
            <p>
              In no event shall BankConverts, its owners, or its affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of our Service, whether based on contract, tort, strict liability, or otherwise.
            </p>
            
            <h2 className="text-2xl font-semibold pt-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
            
            <h2 className="text-2xl font-semibold pt-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us via the information provided on our website.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;
