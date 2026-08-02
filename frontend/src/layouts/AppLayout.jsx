import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Placeholder */}
      <div className="flex-1 flex flex-col">
        {/* Navbar Placeholder */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
