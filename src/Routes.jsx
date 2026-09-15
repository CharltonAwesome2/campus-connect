import { createBrowserRouter } from 'react-router';
import Login from '@pages/Login';
import Home from '@pages/Home';
import StudentDashboard from '@pages/StudentDashboard';
import LandlordDashboard from '@pages/LandlordDashboard';
import AdminDashboard from '@pages/AdminDashboard';
import NotFound from '@pages/NotFound';

export const router = createBrowserRouter(
  [
    { path: '/', Component: Login },
    { path: '/select-role', Component: Home },
    { path: '/student', Component: StudentDashboard },
    { path: '/landlord', Component: LandlordDashboard },
    { path: '/admin', Component: AdminDashboard },
    { path: '*', Component: NotFound },
  ],
  { basename: '/campus-connect' },
);