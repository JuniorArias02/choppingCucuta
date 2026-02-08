import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useCart } from '../../store/CartContext';
import { LogOut, ShoppingCart, Search, Menu, User, LayoutDashboard } from 'lucide-react';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${e.target.value}`);
        }
    };

    return (
        <div className="min-h-screen bg-sc-navy font-sans text-slate-100">
            {/* Background Ambient Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sc-magenta/10 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sc-cyan/10 rounded-full blur-[150px] opacity-20"></div>
            </div>

            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-sc-navy-card/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 gap-4">

                        {/* Logo & Menu */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <button className="p-2 -ml-2 hover:bg-white/5 rounded-lg md:hidden text-slate-300">
                                    <Menu size={24} />
                                </button>
                                <Link to="/" className="flex items-center gap-3 group">
                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-sc-magenta/20 group-hover:shadow-sc-magenta/40 transition-shadow duration-300">
                                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all leading-none">
                                            Shopping
                                        </span>
                                        <span className="text-xs font-bold text-sc-magenta tracking-wide uppercase leading-none mt-0.5">Cúcuta</span>
                                    </div>
                                </Link>
                            </div>

                            {/* Desktop Links */}
                            <div className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/products?ofertas=true"
                                    className="px-4 py-2 rounded-full bg-sc-magenta/10 text-sc-magenta hover:bg-sc-magenta hover:text-white transition-all text-sm font-bold flex items-center gap-2 border border-sc-magenta/20 hover:border-sc-magenta"
                                >
                                    Ofertas 🔥
                                </Link>
                            </div>
                        </div>

                        {/* Search Bar - Centered & Wide */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-6">
                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    onKeyDown={handleSearch}
                                    className="w-full pl-5 pr-12 py-3 rounded-full bg-sc-navy border border-slate-700 focus:border-sc-cyan/50 focus:ring-2 focus:ring-sc-cyan/20 outline-none transition-all text-sm text-white placeholder-slate-500"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 group-focus-within:text-sc-cyan transition-colors">
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 sm:gap-6">

                            {user ? (
                                <>
                                    {/* User Menu */}
                                    <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition group relative">
                                        <div className="w-9 h-9 bg-gradient-to-br from-sc-magenta to-sc-purple p-[1px] rounded-full">
                                            <div className="w-full h-full bg-sc-navy rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {user?.nombre?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                        <div className="hidden lg:block text-sm leading-tight text-right">
                                            <p className="text-slate-400 text-xs">Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}</p>
                                            <p className="font-bold text-white group-hover:text-sc-cyan transition-colors">Mi Cuenta</p>
                                        </div>

                                        {/* Dropdown for Admin/Vendedor */}
                                        {/* Dropdown for Admin/Vendedor/Cliente */}
                                        <div className="absolute top-full right-0 pt-4 w-56 hidden group-hover:block transition-all z-50">
                                            <div className="bg-sc-navy-card rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                                                <Link
                                                    to={user.rol_id === 2 ? "/client/dashboard" : "/admin/dashboard"}
                                                    className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-sc-cyan font-medium flex items-center gap-3 transition-colors"
                                                >
                                                    <LayoutDashboard size={18} /> {user.rol_id === 2 ? "Ir a mi Panel" : "Ir al Panel Admin"}
                                                </Link>
                                                <button onClick={logout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium flex items-center gap-3 transition-colors border-t border-slate-700/50">
                                                    <LogOut size={18} /> Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-xl transition group text-slate-300 hover:text-white">
                                    <User size={22} className="group-hover:text-sc-cyan transition-colors" />
                                    <div className="hidden lg:block text-sm leading-tight">
                                        <p className="text-slate-500 text-xs">Bienvenido</p>
                                        <p className="font-bold group-hover:text-sc-cyan transition-colors">Iniciar Sesión</p>
                                    </div>
                                </Link>
                            )}

                            {/* Cart */}
                            <Link to="/cart" className="relative p-2.5 hover:bg-white/5 rounded-full transition group text-slate-300 hover:text-white">
                                <ShoppingCart size={24} className="group-hover:text-sc-magenta transition-colors" />
                                {count > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-sc-magenta text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-sc-navy shadow-lg transform group-hover:scale-110 transition-transform">
                                        {count}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden px-4 pb-4">
                    <div className="relative w-full group">
                        <input
                            type="text"
                            placeholder="Buscar en la tienda..."
                            onKeyDown={handleSearch}
                            className="w-full pl-5 pr-12 py-2.5 rounded-full bg-sc-navy/50 border border-slate-700 focus:border-sc-cyan transition-all text-sm text-white"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 group-focus-within:text-sc-cyan transition-colors">
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
