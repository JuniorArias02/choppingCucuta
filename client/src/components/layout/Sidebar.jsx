import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, LogOut, Home, X, Settings } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import Swal from 'sweetalert2';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { logout } = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar Sesión?',
            text: "¿Estás seguro de que deseas salir?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D9258B',
            cancelButtonColor: '#1e293b',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            background: '#151E32',
            color: '#fff',
            customClass: {
                popup: 'border border-white/10 shadow-2xl shadow-sc-magenta/10 rounded-2xl'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
            }
        });
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Resumen', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Mis Productos', icon: Package },
        { path: '/admin/create-product', label: 'Crear Producto', icon: PlusCircle },
        { path: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
        { path: '/admin/settings', label: 'Configuración', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 
                bg-sc-navy-card/90 backdrop-blur-md border-r border-slate-800
                transform transition-transform duration-300 ease-in-out shadow-2xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Brand Header */}
                    <div className="h-24 flex items-center px-8 border-b border-slate-800/60 bg-gradient-to-r from-sc-navy-card to-transparent">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-sc-magenta/20 group-hover:shadow-sc-magenta/40 transition-shadow duration-300">
                                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all">
                                    Shopping
                                </span>
                                <span className="text-sm font-bold text-sc-magenta tracking-wide uppercase">Cúcuta</span>
                            </div>
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-slate-400 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Menu Principal
                        </div>
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group overflow-hidden
                                        ${active
                                            ? 'text-white shadow-lg shadow-sc-magenta/10 bg-gradient-to-r from-sc-magenta/10 to-transparent'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {active && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sc-magenta rounded-r-full" />
                                    )}
                                    <item.icon
                                        size={22}
                                        className={`transition-colors duration-300 ${active ? 'text-sc-magenta' : 'text-slate-500 group-hover:text-sc-cyan'}`}
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
                            <Home size={20} className="text-sc-cyan" />
                            Ir a la Tienda
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                        >
                            <LogOut size={20} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
