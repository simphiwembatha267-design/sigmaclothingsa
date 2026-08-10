import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Cart } from './Cart';
import { NewsletterModal } from './NewsletterModal';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 sm:pb-24">
        <Outlet />
      </main>
      <Footer />
      <Cart />
      <NewsletterModal />
    </div>
  );
}
