import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Package, Eye, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import Price from '../../components/ui/Price';

export default function ClientOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

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

    useEffect(() => {
        fetchOrders();
    }, []);

    const toggleOrder = (id) => {
        if (expandedOrder === id) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(id);
        }
    };

    const handleCancel = async (orderId) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto. El pedido será cancelado.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, cancelar pedido',
            cancelButtonText: 'No, mantener',
            background: '#151E32',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const OrderService = (await import('../../services/OrderService')).default;
                await OrderService.cancelOrder(orderId);
                Swal.fire({
                    title: '¡Cancelado!',
                    text: 'El pedido ha sido cancelado.',
                    icon: 'success',
                    background: '#151E32',
                    color: '#fff'
                });
                fetchOrders();
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cancelar el pedido.',
                    icon: 'error',
                    background: '#151E32',
                    color: '#fff'
                });
            }
        }
    };

    const handlePay = async (order) => {
        try {
            Swal.fire({
                title: 'Iniciando Pasarela...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                background: '#151E32',
                color: '#fff'
            });

            const PaymentService = (await import('../../services/PaymentService')).default;
            const wompiParams = await PaymentService.initWompiTransaction(order.id);

            // Load Widget
            if (!document.getElementById('wompi-widget-script')) {
                const script = document.createElement('script');
                script.src = 'https://checkout.wompi.co/widget.js';
                script.id = 'wompi-widget-script';
                script.async = true;
                document.body.appendChild(script);

                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }

            // Close Swal loading
            Swal.close();

            // Ask User for Preference (Widget vs Web)
            const { value: preference } = await Swal.fire({
                title: '<strong class="text-white text-xl">¿Cómo prefieres pagar?</strong>',
                html: `
                    <div class="flex flex-col gap-4 mt-4">
                        <button id="btn-widget-order" class="group relative flex items-center gap-4 p-4 rounded-xl bg-sc-navy border border-white/10 hover:border-sc-cyan/50 transition-all hover:bg-white/5 text-left">
                            <div class="bg-sc-cyan/10 p-3 rounded-full text-sc-cyan group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                            </div>
                            <div>
                                <h4 class="font-bold text-white text-lg">En esta web</h4>
                                <p class="text-sm text-slate-400">Paga sin salir de Venezia Pizzas (Widget).</p>
                            </div>
                        </button>

                        <button id="btn-web-order" class="group relative flex items-center gap-4 p-4 rounded-xl bg-sc-navy border border-white/10 hover:border-sc-magenta/50 transition-all hover:bg-white/5 text-left">
                            <div class="bg-sc-magenta/10 p-3 rounded-full text-sc-magenta group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                            </div>
                            <div>
                                <h4 class="font-bold text-white text-lg">Ir a Wompi</h4>
                                <p class="text-sm text-slate-400">Paga en la página segura de Wompi.</p>
                            </div>
                        </button>
                    </div>
                `,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                background: '#151E32',
                color: '#fff',
                width: 500,
                didOpen: () => {
                    document.getElementById('btn-widget-order').addEventListener('click', () => Swal.clickConfirm());
                    document.getElementById('btn-web-order').addEventListener('click', () => Swal.clickDeny());
                }
            });

            if (preference === true) { // Widget Selected
                // Load Widget Logic
                if (!document.getElementById('wompi-widget-script')) {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.wompi.co/widget.js';
                    script.id = 'wompi-widget-script';
                    script.async = true;
                    document.body.appendChild(script);

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                    });
                }

                const checkout = new window.WidgetCheckout({
                    currency: wompiParams.currency,
                    amountInCents: wompiParams.amount_in_cents,
                    reference: wompiParams.reference,
                    publicKey: wompiParams.public_key,
                    signature: { integrity: wompiParams.signature },
                    redirectUrl: wompiParams.redirect_url,
                });

                checkout.open(function (result) {
                    const transaction = result.transaction;
                    if (transaction.status === 'APPROVED') {
                        Swal.fire({
                            title: '¡Pago Exitoso!',
                            text: `Transacción aprobada: ${transaction.id}`,
                            icon: 'success',
                            background: '#151E32',
                            color: '#fff'
                        }).then(() => {
                            fetchOrders();
                        });
                    } else if (transaction.status === 'DECLINED') {
                        Swal.fire({
                            title: 'Pago Rechazado',
                            text: 'Tu banco ha rechazado la transacción.',
                            icon: 'error',
                            background: '#151E32',
                            color: '#fff'
                        });
                    } else {
                        fetchOrders(); // Refresh status
                    }
                });

            } else if (preference === false) { // Web Selected
                // Validate Params
                const requiredParams = ['public_key', 'currency', 'amount_in_cents', 'reference', 'signature', 'redirect_url'];
                const missingParams = requiredParams.filter(param => !wompiParams[param]);

                if (missingParams.length > 0) {
                    console.error('Missing Wompi Params:', missingParams);
                    Swal.fire({
                        title: 'Error de Configuración',
                        text: `Faltan parámetros de pago: ${missingParams.join(', ')}`,
                        icon: 'error',
                        background: '#151E32',
                        color: '#fff'
                    });
                    return;
                }

                // Create Form for POST request
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://checkout.wompi.co/p/';

                const params = {
                    'public-key': wompiParams.public_key,
                    'currency': wompiParams.currency,
                    'amount-in-cents': wompiParams.amount_in_cents,
                    'reference': wompiParams.reference,
                    'signature:integrity': wompiParams.signature, // Key name for POST
                    'redirect-url': wompiParams.redirect_url
                };

                for (const key in params) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = params[key];
                    form.appendChild(input);
                }

                document.body.appendChild(form);
                form.submit();
            }

        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo iniciar el pago.',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
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

                                {/* Actions for Pending Orders */}
                                {order.estado === 'pendiente' && (
                                    <div className="flex flex-wrap gap-3 mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <div className="flex-1">
                                            <p className="text-amber-500 font-bold mb-1">Pago Pendiente</p>
                                            <p className="text-xs text-amber-200/70">Tu pedido ha sido reservado. Completa el pago para procesar el envío.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCancel(order.id); }}
                                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-bold transition-colors"
                                            >
                                                Cancelar Pedido
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePay(order); }}
                                                className="px-4 py-2 bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-sc-magenta/20 transition-transform hover:-translate-y-0.5"
                                            >
                                                Pagar Ahora
                                            </button>
                                        </div>
                                    </div>
                                )}

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
