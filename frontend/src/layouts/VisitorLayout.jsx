import React from 'react';
import VisitorNavbar from '../components/common/Navbar/VisitorNavbar';
import Footer from '../components/common/Footer/Footer';

const VisitorLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <VisitorNavbar />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default VisitorLayout;
