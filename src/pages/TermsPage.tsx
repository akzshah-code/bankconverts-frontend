import Header from '../components/Header';
import Footer from '../components/Footer';
import TermsOfService from '../components/TermsOfService';
import { User } from '../lib/types';

interface TermsPageProps {
  user: User | null;
  onLogout: () => void;
}

const TermsPage = ({ user, onLogout }: TermsPageProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-grow">
        <TermsOfService />
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;