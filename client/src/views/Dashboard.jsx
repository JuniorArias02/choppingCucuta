import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products')
            .then(res => setProducts(res.data.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Derived stats for demo
    const totalProducts = products.length;
    const avgPrice = products.length > 0
        ? (products.reduce((acc, p) => acc + parseFloat(p.precio_base), 0) / products.length).toFixed(2)
        : 0;

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-sc-navy-card/80 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl hover:shadow-2xl hover:bg-sc-navy-card hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:bg-${color}-500 group-hover:text-white transition-colors duration-300`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
    );

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-sc-navy-card rounded-2xl border border-slate-800" />
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
                <p className="text-slate-400">Bienvenido de nuevo a Shopping Cúcuta.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Productos"
                    value={totalProducts}
                    icon={Package}
                    color="sc-magenta"
                    trend="+12%"
                />
                <StatCard
                    title="Precio Promedio"
                    value={`$${avgPrice}`}
                    icon={DollarSign}
                    color="sc-cyan"
                />
                <StatCard
                    title="Ventas del Mes"
                    value="154"
                    icon={TrendingUp}
                    color="sc-purple"
                    trend="+5.2%"
                />
                <StatCard
                    title="Actividad"
                    value="98%"
                    icon={Activity}
                    color="orange"
                />
            </div>

            {/* Products Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Productos Recientes</h2>
                    <button className="text-sm text-sc-cyan font-semibold hover:text-white transition-colors">
                        Ver Todos
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-sc-navy-card/50 backdrop-blur-sm rounded-3xl border border-slate-800 border-dashed">
                        <Package size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 text-lg">No products found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {products.map(p => (
                            <div key={p.id} className="bg-sc-navy-card/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-sc-cyan/50 hover:shadow-lg hover:shadow-sc-cyan/10 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl group-hover:bg-white group-hover:text-sc-navy transition-colors">
                                        {p.nombre.charAt(0)}
                                    </div>
                                    <div className="px-3 py-1 rounded-lg bg-sc-navy border border-slate-700 text-sc-cyan text-sm font-bold">
                                        ${p.precio_base}
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-sc-cyan transition-colors">{p.nombre}</h3>
                                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">{p.descripcion}</p>
                                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm">
                                    <span className="text-slate-500">ID: #{p.id}</span>
                                    <span className="text-sc-magenta font-medium group-hover:underline cursor-pointer">Editar</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
