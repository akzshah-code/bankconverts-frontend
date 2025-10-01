
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Assuming you have a Header component
import Footer from './Footer'; // Assuming you have a Footer component


const PageLayout = () => {
  return (
      <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
              <Outlet />
          </main>
          <Footer />
      </div>
  );
};

export default PageLayout;
