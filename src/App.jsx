import { RouterProvider } from 'react-router';
import { router } from './Routes';
import Sonner from '@components/Sonner';
import { DataProvider } from '@data/DataContext';

export default function App() {
  return (
    <DataProvider>
      <RouterProvider router={router} />
      <Sonner />
    </DataProvider>
  );
}