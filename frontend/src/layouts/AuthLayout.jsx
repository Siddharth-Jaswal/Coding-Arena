import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Graphic/Brand Panel Placeholder */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center">
        <h1 className="text-4xl font-bold">Coding Arena</h1>
      </div>
      {/* Form Panel Placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  );
};
