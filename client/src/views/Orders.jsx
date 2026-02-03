import { useState, useEffect } from 'react';
import { Eye, Search, Filter, Calendar, Download } from 'lucide-react';
import OrderService from '../services/OrderService';
import Swal from 'sweetalert2';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await OrderService.getOrders();
            // The API returns paginated data (response.data or directly array if we change controller)
            // Based on controller it returns pagination object. 
            // Let's assume response.data contains 'data' array or is the array if wrapped.
            // Controller: return response()->json($orders); -> Paginator json structure has 'data'
            setOrders(data.data || []);
        } catch (error) {
            console.error("Error fetching orders", error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los pedidos.',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pendiente': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            case 'Preparando': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
            case 'Enviado': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'Entregado': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'Cancelado': return 'bg-red-500/10 text-red-500 border border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
        }
    };

    const handleViewOrder = (id) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        Swal.fire({
            title: `<span class="text-white">Pedido #${id}</span>`,
            html: `
                <div class="text-left bg-sc-navy p-4 rounded-xl border border-white/5">
                    <p class="text-white font-bold mb-3">Fecha: ${order.fecha}</p>
                    
                    <p class="text-slate-400 text-sm mb-1">Items</p>
                    <div class="space-y-2 mb-3">
                        ${order.items.map(item => `
                            <div class="flex justify-between text-sm text-white">
                                <span>${item.cantidad}x ${item.producto}</span>
                                <span>$${Number(item.precio).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="flex justify-between items-center pt-3 border-t border-white/10">
                        <span class="text-slate-400">Total</span>
                        <span class="text-xl font-bold text-sc-cyan">$${Number(order.total).toLocaleString()}</span>
                    </div>
                </div>
            `,
            background: '#151E32',
            confirmButtonColor: '#00C2CB',
            confirmButtonText: 'Cerrar',
            width: 400
        });
    };

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchTerm)
    );

    if (loading) {
        return <div className="text-white text-center py-20">Cargando pedidos...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Pedidos</h1>
                    <p className="text-slate-400">Gestiona y rastrea el estado de las órdenes.</p>
                </div>
                <button className="flex items-center gap-2 bg-sc-navy-card/80 hover:bg-white/5 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl border border-white/5 transition-all">
                    <Download size={18} />
                    <span>Exportar CSV</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-sc-navy-card/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        placeholder="Buscar por ID de pedido..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sc-navy border border-slate-700 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan outline-none transition text-white placeholder-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={18} />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 text-slate-300 bg-sc-navy hover:bg-white/5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all">
                        <Calendar size={18} />
                        <span className="hidden sm:inline">Fecha</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 text-slate-300 bg-sc-navy hover:bg-white/5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all">
                        <Filter size={18} />
                        <span>Filtros</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-sc-navy-card/80 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-5 font-semibold text-slate-300 text-sm">Pedido</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm">Fecha</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm">Items</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm">Total</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm text-center">Estado</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5 font-bold text-white group-hover:text-sc-cyan transition-colors">#{order.id}</td>
                                    <td className="p-5 text-sm text-slate-400">{order.fecha}</td>
                                    <td className="p-5 text-sm text-slate-300">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {order.preview_images?.map((img, i) => (
                                                <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-sc-navy object-cover" src={img || '/placeholder-product.jpg'} alt="" />
                                            ))}
                                            <span className="ml-4 self-center text-xs text-slate-400">
                                                {order.items_count} items
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm font-bold text-white">${Number(order.total).toLocaleString()}</td>
                                    <td className="p-5 text-center">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold leading-5 rounded-full ${getStatusColor(order.estado)}`}>
                                            {order.estado}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => handleViewOrder(order.id)}
                                            className="p-2 text-slate-400 hover:text-sc-cyan hover:bg-sc-cyan/10 rounded-lg transition-all"
                                            title="Ver Detalles"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                            <Search className="text-slate-500" size={32} />
                        </div>
                        <p className="text-slate-400 text-lg">No se encontraron pedidos.</p>
                        <p className="text-slate-600 text-sm mt-1">Tu historial de compras aparecerá aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
