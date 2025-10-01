
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Assuming you have a Header component
import Footer from './Footer'; // Assuming you have a Footer component


const PageLayout = () => {
  return (
    <>
      <Header />
      <main>
        {/* The Outlet component will render the matching child route component */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PageLayout;
