import { createBrowserRouter } from 'react-router';
import { Login } from './pages/login';
import { Home } from './pages/home';
import { StudentDashboard } from './pages/student-dashboard';
import { LandlordDashboard } from './pages/landlord-dashboard';
import { AdminDashboard } from './pages/admin-dashboard';
import { NotFound } from './pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login
  },
  {
    path: '/select-role',
    Component: Home
  },
  {
    path: '/student',
    Component: StudentDashboard
  },
  {
    path: '/landlord',
    Component: LandlordDashboard
  },
  {
    path: '/admin',
    Component: AdminDashboard
  },
  {
    path: '*',
    Component: NotFound
  }
]);