import { useState, useEffect } from 'react';
import CartService from '../services/CartService';
import { Trash2, Plus, Minus, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import Price from '../components/ui/Price';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Swal from 'sweetalert2';

export default function Cart() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/100?text=No+Img';
        if (img.startsWith('http')) return img;
        return `${API_URL}${img}`;
    };

    const fetchCart = async () => {
        try {
            const data = await CartService.getCart();
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [user]);

    const updateQuantity = async (id, delta) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newQty = item.cantidad + delta;
        if (newQty < 1 || newQty > item.stock_max) return;

        try {
            // Optimistic update
            setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: newQty } : i));
            await CartService.updateItem(id, newQty);
        } catch (error) {
            console.error(error);
            // Revert on error
            fetchCart();
        }
    };

    const removeItem = async (id) => {
        try {
            // Optimistic update
            setItems(prev => prev.filter(i => i.id !== id));
            await CartService.removeItem(id);
        } catch (error) {
            console.error(error);
            fetchCart();
        }
    };

    const handleCheckout = () => {
        if (!user) {
            Swal.fire({
                title: 'Inicia sesión para continuar',
                text: "Necesitas una cuenta para finalizar tu compra.",
                icon: 'info',
                background: '#151E32',
                color: '#fff',
                showCancelButton: true,
                confirmButtonColor: '#D9258B',
                cancelButtonColor: '#475569',
                confirmButtonText: 'Iniciar Sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
            return;
        }

        // Proceed to mock checkout
        Swal.fire({
            title: '¡Pedido Confirmado!',
            text: 'Gracias por tu compra (Mock Checkout).',
            icon: 'success',
            background: '#151E32',
            color: '#fff',
            confirmButtonColor: '#00C2CB'
        });
    };

    const subtotal = items.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
    const shipping = 0; // Free for now
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-sc-navy-card rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                    <ShoppingBag size={40} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h2>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">Parece que aún no has agregado nada. Explora nuestra tienda y encuentra lo que buscas.</p>
                <Link to="/" className="bg-sc-magenta hover:bg-pink-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-sc-magenta/40 hover:-translate-y-1">
                    Empezar a comprar
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-6">
            <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                Tu Carrito <span className="text-lg font-normal text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{items.length} items</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-sc-navy-card/80 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex gap-5 transition hover:border-sc-cyan/20 group">
                            {/* Image */}
                            <div className="w-28 h-28 bg-sc-navy rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                <img src={getImageUrl(item.imagen)} alt={item.producto_nombre} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white text-base md:text-lg line-clamp-2 leading-tight mb-1">
                                            {item.producto_nombre}
                                        </h3>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 mt-2">
                                        {Object.entries(item.atributos).map(([key, val]) => (
                                            <span key={key} className="bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                                                {key}: <span className="text-slate-200">{val}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div className="text-white">
                                        <Price price={item.precio_unitario} discountPercent={item.descuento || 0} size="lg" />
                                    </div>

                                    {/* Qty Controls */}
                                    <div className="flex items-center bg-sc-navy border border-slate-700 rounded-xl h-10">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-10 h-full flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white rounded-l-xl transition-colors disabled:opacity-30"
                                            disabled={item.cantidad <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-white">{item.cantidad}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-10 h-full flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white rounded-r-xl transition-colors disabled:opacity-30"
                                            disabled={item.cantidad >= item.stock_max}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="bg-emerald-500/10 p-4 rounded-xl flex items-start gap-3 text-emerald-400 text-sm border border-emerald-500/20">
                        <ShieldCheck className="flex-shrink-0 mt-0.5" size={18} />
                        <p>Compra protegida: Recibe el producto que esperabas o te devolvemos tu dinero.</p>
                    </div>
                </div>

                {/* Summary / User Data Mock */}
                <div className="space-y-6">
                    <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 sticky top-24 shadow-xl">
                        <h3 className="font-bold text-lg mb-6 text-white">Resumen del Pedido</h3>

                        <div className="space-y-3 text-sm text-slate-400 pb-6 border-b border-white/10">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-slate-200">
                                    <Price price={subtotal} size="sm" />
                                </span>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                                <span>Envío</span>
                                <span className="font-medium">Gratis</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-6 font-bold text-2xl text-white">
                            <span>Total</span>
                            <span className="text-sc-cyan">
                                <Price price={total} size="xl" />
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sc-magenta/25 hover:shadow-sc-magenta/40 transition flex items-center justify-center gap-2 group hover:-translate-y-1"
                        >
                            Finalizar Compra
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-xs text-slate-500 mb-2">
                                Transacciones seguras y encriptadas
                            </p>
                            <div className="flex justify-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="h-6 w-10 bg-white rounded"></div>
                                <div className="h-6 w-10 bg-white rounded"></div>
                                <div className="h-6 w-10 bg-white rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
