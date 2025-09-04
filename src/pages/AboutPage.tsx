import Header from '../components/Header';
import Footer from '../components/Footer';
import About from '../components/About';
import { User } from '../lib/types';

interface AboutPageProps {
  user: User | null;
  onLogout: () => void;
}

const AboutPage = ({ user, onLogout }: AboutPageProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-grow">
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;