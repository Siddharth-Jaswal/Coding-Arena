import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AppProvider } from './providers/AppProvider';

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
