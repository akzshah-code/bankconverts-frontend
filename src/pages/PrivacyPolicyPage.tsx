import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import { User } from '../lib/types';

interface PrivacyPolicyPageProps {
  user: User | null;
  onLogout: () => void;
  backendStatus: 'checking' | 'ok' | 'error';
}

const PrivacyPolicyPage = ({ user, onLogout, backendStatus }: PrivacyPolicyPageProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} backendStatus={backendStatus} />
      <main className="flex-grow">
        <PrivacyPolicy />
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;