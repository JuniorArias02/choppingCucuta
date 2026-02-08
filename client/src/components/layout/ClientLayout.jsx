import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Heart, ShoppingBag, Settings, LogOut, Home, X, Menu, CreditCard } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export default function ClientLayout() {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/client/dashboard', label: 'Resumen', icon: LayoutDashboard },
        { path: '/client/favorites', label: 'Mis Favoritos', icon: Heart },
        { path: '/client/pending-payments', label: 'Pagos Pendientes', icon: CreditCard },
        { path: '/client/orders', label: 'Mis Compras', icon: ShoppingBag },
        { path: '/client/settings', label: 'Configuración', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-sc-navy font-sans text-slate-100 overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 
                bg-sc-navy-card/90 backdrop-blur-md border-r border-slate-800
                transform transition-transform duration-300 ease-in-out shadow-2xl
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Brand Header */}
                    <div className="h-24 flex items-center px-8 border-b border-slate-800/60 bg-gradient-to-r from-sc-navy-card to-transparent">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-sc-cyan/20 group-hover:shadow-sc-cyan/40 transition-shadow duration-300">
                                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all">
                                    Shopping
                                </span>
                                <span className="text-sm font-bold text-sc-cyan tracking-wide uppercase">Cliente</span>
                            </div>
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-slate-400 hover:text-white transition-colors"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Mi Cuenta
                        </div>
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group overflow-hidden
                                        ${active
                                            ? 'text-white shadow-lg shadow-sc-cyan/10 bg-gradient-to-r from-sc-cyan/10 to-transparent'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {active && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sc-cyan rounded-r-full" />
                                    )}
                                    <item.icon
                                        size={22}
                                        className={`transition-colors duration-300 ${active ? 'text-sc-cyan' : 'text-slate-500 group-hover:text-sc-cyan'}`}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 mx-4 mb-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                        >
                            <Home size={20} className="text-sc-magenta" />
                            Ir a la Tienda
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                        >
                            <LogOut size={20} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-sc-navy relative">
                {/* Background Ambient Glows */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-sc-cyan/5 rounded-full blur-[100px] opacity-30"></div>
                </div>

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between p-4 lg:hidden bg-sc-navy/80 backdrop-blur-md border-b border-white/5">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-white">Mi Panel</span>
                    <div className="w-10"></div> {/* Spacer for center alignment */}
                </div>

                <div className="container mx-auto px-6 py-8 relative z-10 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
