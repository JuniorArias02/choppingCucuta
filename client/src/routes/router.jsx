import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../views/Login';
import Register from '../views/Register';
import GuestLayout from '../components/layout/GuestLayout';
import AppLayout from '../components/layout/AppLayout';
import ProductDetail from '../views/ProductDetail';
import Home from '../views/Home';
import Cart from '../views/Cart';
import CreateProduct from '../views/CreateProduct';
import { useAuth } from '../store/AuthContext';
import AdminLayout from '../components/layout/AdminLayout';
import ProductList from '../views/ProductList';
import Orders from '../views/Orders';

import Dashboard from '../views/Dashboard';

import SearchResults from '../views/SearchResults';
import Settings from '../views/Settings';
import ClientLayout from '../components/layout/ClientLayout';
import ClientDashboard from '../views/client/ClientDashboard';
import ClientOrders from '../views/client/ClientOrders';
import ClientFavorites from '../views/client/ClientFavorites';

// Simple Role Guard
const RoleGuard = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    // Allow if user exists and has allowed rol_id (1: Admin, 2: Vendedor)
    if (user && allowedRoles.includes(user.rol_id)) {
        return children;
    }
    return <Navigate to="/" replace />;
};

// Orders redirect based on role
const OrdersRedirect = () => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    // Client role (3) goes to /client/orders, others go to /admin/orders
    const ordersRoute = user.rol_id === 3 ? '/client/orders' : '/admin/orders';
    return <Navigate to={ordersRoute} replace />;
};

const router = createBrowserRouter([
    {
        path: '/orders',
        element: <OrdersRedirect />
    },
    {
        path: '/dashboard',
        element: <Navigate to="/admin/dashboard" replace />
    },
    {
        element: <GuestLayout />,
        children: [
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            }
        ]
    },
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'product/:id',
                element: <ProductDetail />,
            },
            {
                path: 'cart',
                element: <Cart />,
            },
            {
                path: 'search',
                element: <SearchResults />,
            },
        ],
    },
    // Admin / Seller Routes
    {
        path: '/admin',
        element: (
            <RoleGuard allowedRoles={[1, 2]}>
                <AdminLayout />
            </RoleGuard>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'products',
                element: <ProductList />
            },
            {
                path: 'create-product',
                element: <CreateProduct />
            },
            {
                path: 'orders',
                element: <Orders />
            },
            {
                path: 'settings',
                element: <Settings />
            }
        ]
    },
    // Client Routes
    {
        path: '/client',
        element: (
            <RoleGuard allowedRoles={[3]}>
                <ClientLayout />
            </RoleGuard>
        ),
        children: [
            {
                path: 'dashboard',
                element: <ClientDashboard />
            },
            {
                path: 'orders',
                element: <ClientOrders />
            },
            {
                path: 'favorites',
                element: <ClientFavorites />
            },
            {
                path: 'settings',
                element: <Settings /> // Reuse existing settings view
            }
        ]
    }
]);

export default router;
