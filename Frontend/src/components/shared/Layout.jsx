import { useState } from 'react';
import SideNav from './SideNav';

export default function Layout({ children }) {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  const closeSideNav = () => {
    setIsSideNavOpen(false);
  };

  // Listen for toggle event from NavBar
  if (typeof window !== 'undefined') {
    window.toggleSideNav = toggleSideNav;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav isOpen={isSideNavOpen} onClose={closeSideNav} />
      {/* Main content area */}
      <main className="flex-1 mt-16 w-full">
        {children}
      </main>
    </div>
  );
}