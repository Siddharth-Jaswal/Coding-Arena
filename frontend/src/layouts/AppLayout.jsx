import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Placeholder */}
      <div className="flex-1 flex flex-col">
        <Navbar variant="app" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
