import { createBrowserRouter } from 'react-router-dom';
import { LandingLayout } from '../layouts/LandingLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ArenaLayout } from '../layouts/ArenaLayout';
import LandingPage from '../pages/LandingPage';
import DesignSystemShowcase from '../pages/DesignSystemShowcase';

// Placeholder Pages
const ProblemsPlaceholder = () => <div>Problems List Placeholder</div>;
const ProblemArenaPlaceholder = () => <div>Problem Arena Placeholder</div>;
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
      { path: 'problems', element: <ProblemsPlaceholder /> },
      { path: 'profile/:id', element: <ProfilePlaceholder /> },
      { path: 'profile/:id/submissions', element: <UserSubmissionsPlaceholder /> },
    ],
  },
  {
    element: <ArenaLayout />,
    children: [
      { path: 'problems/:id', element: <ProblemArenaPlaceholder /> },
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
