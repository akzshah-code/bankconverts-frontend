import Header from '../components/Header';
import Footer from '../components/Footer';
import FAQ from '../components/FAQ';
import { User } from '../lib/types';

interface FaqPageProps {
  user: User | null;
  onLogout: () => void;
  backendStatus: 'checking' | 'ok' | 'error';
}

const FaqPage = ({ user, onLogout, backendStatus }: FaqPageProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} backendStatus={backendStatus} />
      <main className="flex-grow">
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FaqPage;