import { Outlet } from 'react-router-dom';

export const LandingLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Placeholder */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer Placeholder */}
    </div>
  );
};
