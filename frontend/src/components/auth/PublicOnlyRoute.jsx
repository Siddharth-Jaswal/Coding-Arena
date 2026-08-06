import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper, Container } from '@/components/layout';
import { Spinner } from '@/components/ui/Spinner';

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <PageWrapper withBackground>
        <Container className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </Container>
      </PageWrapper>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
