import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function MainLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div aria-hidden="true" className="gb-backdrop pointer-events-none absolute inset-0 -z-10" />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
