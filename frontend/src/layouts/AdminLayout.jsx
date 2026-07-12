import React from 'react';
import AdminNavbar from '../components/common/Navbar/AdminNavbar';
import Footer from '../components/common/Footer/Footer';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
