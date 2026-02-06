import { useEffect, useState } from 'react';
import { ShoppingBag, Heart, Clock, Truck } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ClientDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pendingOrders: 0,
        completedOrders: 0,
        favorites: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/client/dashboard/stats');
                const data = response.data;

                setStats({
                    pendingOrders: data.pending_orders || 0,
                    completedOrders: data.completed_orders || 0,
                    favorites: data.favorites || 0
                });
            } catch (error) {
                console.error("Error fetching client stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const Widget = ({ title, value, icon: Icon, color, link, label }) => (
        <Link to={link || '#'} className="bg-sc-navy-card p-6 rounded-2xl border border-white/5 relative group overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={80} />
            </div>
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-10`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white mb-2">{value}</p>
                <div className="flex items-center text-xs font-semibold text-sc-cyan group-hover:underline">
                    {label}
                </div>
            </div>
        </Link>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Hola, {user?.nombre?.split(' ')[0]} 👋</h1>
                <p className="text-slate-400">Bienvenido a tu panel de cliente. Aquí tienes un resumen de tu actividad.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Widget
                    title="Pedidos Pendientes"
                    value={loading ? '-' : stats.pendingOrders}
                    icon={Clock}
                    color="bg-amber-500"
                    link="/client/orders"
                    label="Ver mis pedidos"
                />
                <Widget
                    title="Compras Completadas"
                    value={loading ? '-' : stats.completedOrders}
                    icon={ShoppingBag}
                    color="bg-emerald-500"
                    link="/client/orders"
                    label="Ver historial"
                />
                <Widget
                    title="Favoritos"
                    value={loading ? '-' : stats.favorites}
                    icon={Heart}
                    color="bg-sc-magenta"
                    link="/client/favorites"
                    label="Ver lista de deseos"
                />
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-r from-sc-cyan/20 to-sc-purple/20 border border-sc-cyan/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">¡Gracias por ser parte de Shopping Cúcuta!</h2>
                    <p className="text-slate-300 mb-6">Explora nuestra colección de nuevos productos y encuentra tu próximo estilo favorito.</p>
                    <Link to="/" className="bg-white text-sc-navy font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-2">
                        <ShoppingBag size={20} />
                        Ir a la Tienda
                    </Link>
                </div>
            </div>
        </div>
    );
}
