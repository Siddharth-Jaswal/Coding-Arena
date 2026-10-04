import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '../store/useThemeStore';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import { SiteAccessGate } from '../components/common/SiteAccessGate';
import { ServerWarmupBanner } from '../components/common/ServerWarmupBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppProvider = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Apply theme to the document root
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <SiteAccessGate>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <ServerWarmupBanner />
            {children}
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SiteAccessGate>
  );
};
