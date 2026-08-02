import { Outlet } from 'react-router-dom';

export const ArenaLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Minimal Arena Header Placeholder */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
