import { createBrowserRouter } from 'react-router-dom';
import { LandingLayout } from '../layouts/LandingLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ArenaLayout } from '../layouts/ArenaLayout';
import LandingPage from '../pages/LandingPage';
import DesignSystemShowcase from '../pages/DesignSystemShowcase';

import ProblemsPage from '../pages/ProblemsPage';
import ProblemPage from '../pages/ProblemPage';

import ArenaPage from '../pages/ArenaPage';

// Placeholder Pages
const ProfilePlaceholder = () => <div>Profile Placeholder</div>;
const UserSubmissionsPlaceholder = () => <div>User Submissions Placeholder</div>;
const SubmissionDetailsPlaceholder = () => <div>Submission Details Placeholder</div>;
const NotFoundPlaceholder = () => <div>404 Not Found</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      { index: true, element: <LandingPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: 'problems', element: <ProblemsPage /> },
      { path: 'problems/:id', element: <ProblemPage /> },
      { path: 'profile/:id', element: <ProfilePlaceholder /> },
      { path: 'profile/:id/submissions', element: <UserSubmissionsPlaceholder /> },
    ],
  },
  {
    element: <ArenaLayout />,
    children: [
      { path: 'problems/:id/solve', element: <ArenaPage /> },
      { path: 'submissions/:id', element: <SubmissionDetailsPlaceholder /> },
    ],
  },
  {
    path: '/design-system',
    element: <DesignSystemShowcase />,
  },
  {
    path: '*',
    element: <NotFoundPlaceholder />,
  },
]);
