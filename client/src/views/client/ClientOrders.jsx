import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Package, Eye, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import Price from '../../components/ui/Price';

export default function ClientOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                const data = response.data.data ? response.data.data : (Array.isArray(response.data) ? response.data : []);
                setOrders(data);
            } catch (error) {
                console.error("Error loading orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const toggleOrder = (id) => {
        if (expandedOrder === id) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pendiente': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Enviado': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Entregado': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Cancelado': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/400x500?text=No+Image';
        if (img.startsWith('http')) return img;
        return `${API_URL}${img}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-sc-navy-card/50 rounded-3xl border border-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Package size={40} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No tienes pedidos</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                    Aún no has realizado ninguna compra.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Package className="text-emerald-400" /> Mis Compras
                </h1>
                <p className="text-slate-400">Historial y estado de tus pedidos.</p>
            </div>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-sc-navy-card/80 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-sc-cyan/20">
                        {/* Order Header */}
                        <div
                            onClick={() => toggleOrder(order.id)}
                            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-sc-navy rounded-xl border border-white/5">
                                    <Package size={24} className="text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Pedido #{order.id}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Calendar size={14} />
                                        <span>{order.fecha}</span>
                                        <span className="mx-1">•</span>
                                        <span>{order.items_count} items</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(order.estado)}`}>
                                    {order.estado}
                                </span>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Total</p>
                                    <Price price={order.total} size="lg" className="text-sc-cyan" />
                                </div>
                                <div className={`text-slate-500 transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedOrder === order.id && (
                            <div className="border-t border-white/5 bg-sc-navy/30 p-5 animate-in slide-in-from-top-2 duration-200">
                                <h4 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Productos</h4>
                                <div className="space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 bg-sc-navy rounded-xl p-3 border border-white/5">
                                            <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={getImageUrl(item.imagen)}
                                                    alt={item.producto}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-bold text-white text-sm line-clamp-1">{item.producto}</h5>
                                                <p className="text-xs text-slate-500">Cantidad: {item.cantidad} x <Price price={item.precio} size="xs" /></p>
                                            </div>
                                            <div className="text-right font-bold text-white">
                                                <Price price={item.precio * item.cantidad} size="sm" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
