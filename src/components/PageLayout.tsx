// src/components/PageLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  /**
   * Optional children when PageLayout is used as a wrapper:
   * <PageLayout><Dashboard /></PageLayout>
   *
   * When used as a route element with <Outlet />, children will be undefined
   * and the Outlet will render the matched page instead.
   */
  children?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* If children are provided, render them; otherwise render Outlet */}
        {children ?? <Outlet />}
      </main>

      <Footer />
    </div>
  );
};

export default PageLayout;
