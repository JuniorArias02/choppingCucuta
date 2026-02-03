import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { AuthProvider } from './store/AuthContext';
import { CartProvider } from './store/CartContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
