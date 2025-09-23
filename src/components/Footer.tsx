

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
            <p>&copy; {new Date().getFullYear()} BankConverts. All rights reserved.</p>
            <div className="flex space-x-6">
                <a href="/terms" className="hover:text-gray-300">Terms of Service</a>
                <a href="/privacy" className="hover:text-gray-300">Privacy Policy</a>
                <a href="mailto:support@bankconverts.com" className="hover:text-gray-300">Contact</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

