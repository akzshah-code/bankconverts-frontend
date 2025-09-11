import Header from '../components/Header';
import Footer from '../components/Footer';
import TermsOfService from '../components/TermsOfService';
import { User } from '../lib/types';

interface TermsPageProps {
  user: User | null;
  onLogout: () => void;
  backendStatus: 'checking' | 'ok' | 'error';
}

const TermsPage = ({ user, onLogout, backendStatus }: TermsPageProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} backendStatus={backendStatus} />
      <main className="flex-grow">
        <TermsOfService />
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;