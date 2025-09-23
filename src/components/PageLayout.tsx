import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const PageLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet /> {/* Child routes will be rendered here */}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
