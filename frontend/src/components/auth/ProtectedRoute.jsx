import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper, Container } from '@/components/layout';
import { Spinner } from '@/components/ui/Spinner';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <PageWrapper withBackground>
        <Container className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </Container>
      </PageWrapper>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
