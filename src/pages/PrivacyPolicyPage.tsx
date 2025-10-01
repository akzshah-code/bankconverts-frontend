import React from 'react';

function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </header>

          <div className="text-gray-700 space-y-6">
            <p>
              Your privacy is critically important to us. At BankConverts.com ("BankConverts", "we", "us", or "our"), we have a few fundamental principles. This Privacy Policy explains how we handle your information when you use our website and services (the "Service").
            </p>

            <h2 className="text-2xl font-semibold pt-4">1. The Core Principle: Your Data is Yours</h2>
            <p>
              We have designed BankConverts with privacy as a foundational feature. The core functionality of our service—converting your bank statements—is performed entirely on your device (client-side) in your web browser.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li><strong>We do not upload your files to our servers.</strong> The documents you select for conversion are never transmitted to, stored on, or processed by our servers.</li>
              <li><strong>We do not see your financial data.</strong> Because the processing happens in your browser, we have no access to the content of your bank statements.</li>
              <li><strong>Password unlocking is done locally.</strong> If you provide a password to unlock a PDF, it is used only within your browser to decrypt the file and is never sent over the network.</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-4">2. Information We Do Collect</h2>
            <p>
              While we do not access the content of your files, we do collect a minimal amount of information necessary to provide and improve our service for registered users.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li><strong>Account Information:</strong> When you register for an account, we collect your name and email address. This is used to manage your account, track your usage limits, and communicate with you about the service.</li>
              <li><strong>Payment Information:</strong> If you subscribe to a paid plan, our payment processor (Razorpay) will collect your payment details. We do not store your full credit card information on our servers. We only receive a token to confirm your payment status.</li>
              <li><strong>Usage Analytics:</strong> We may collect anonymous analytics data about how users interact with our website (e.g., page views, button clicks) to improve user experience. This data is aggregated and cannot be used to identify you personally.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold pt-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Provide, maintain, and improve our Service.</li>
                <li>Process transactions and manage your subscription.</li>
                <li>Communicate with you, including sending service-related emails and responding to support requests.</li>
                <li>Monitor and analyze trends to enhance the security and functionality of our Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect the limited account information we store. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold pt-4">5. Third-Party Services</h2>
            <p>
              We use third-party services for payment processing (Razorpay) and potentially for analytics. These services have their own privacy policies, and we recommend you review them.
            </p>

            <h2 className="text-2xl font-semibold pt-4">6. Your Rights</h2>
            <p>
                You have the right to access, update, or delete your account information at any time by logging into your account or contacting us for assistance.
            </p>

            <h2 className="text-2xl font-semibold pt-4">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
            
            <h2 className="text-2xl font-semibold pt-4">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@bankconverts.com" className="text-blue-600 hover:underline">support@bankconverts.com</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrivacyPolicyPage;
