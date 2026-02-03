import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductService from '../services/ProductService';
import Price from '../components/ui/Price';
import { ChevronLeft, Heart, Share2, ShieldCheck, Truck, ShoppingCart, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import AuthService from '../services/AuthService';
import { useCart } from '../store/CartContext';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedAttrs, setSelectedAttrs] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await ProductService.getById(id);
                // Transform images to simple array of strings if they are objects
                const transformedProduct = {
                    ...data,
                    imagenes: data.imagenes.map(img => typeof img === 'string' ? img : img.url_imagen),
                    // Ensure attributes structure matches if needed (API returns nested, mock was flat?)
                    // Assuming API returns comparable structure for now based on controllers
                };
                setProduct(transformedProduct);

                const user = AuthService.getCurrentUser();
                if (data.likes) {
                    setIsLiked(data.likes.some(l => l.usuario_id === user?.id));
                    setLikesCount(data.likes_count || 0);
                } else {
                    setLikesCount(data.likes_count || 0);
                }
            } catch (error) {
                console.error("Error loading product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Validation Logic (moved here to safe guard against null product)
    const isReadyToAdd = product && Object.keys(selectedAttrs || {}).length > 0 &&
        product.variantes.some(v =>
            Object.keys(selectedAttrs || {}).every(k => v.atributos && v.atributos[k] === selectedAttrs[k]) && v.stock > 0
        );

    const currentVariant = product ? product.variantes.find(v => {
        // Need to be careful with attribute matching. 
        // In MOCK: v.atributos = { Talla: 'M', Color: 'Rojo' }
        // In API: v.valores = [ { attribute: { nombre: 'Talla' }, valor: 'M' } ] - Wait, backend structure!
        // Let's check ProductController output structure or just assume simple for now and fix later if broken.
        // Actually, assuming standard pivot structure in backend might need mapping.
        // For now, let's assume the backend 'variantes' has a simple structure or we map it in frontend service.
        // Wait, looking at ProductController 'variantes' relationship, it returns 'variantes.valores.atributo'.
        // This is complex. Mock was: v.atributos = { Key: Value }
        // API likely returns: v.valores = [{ valor: 'Rojo', atributo: { nombre: 'Color' } }]

        // I should probably simplify the matching logic or transform the data in useEffect.
        // Transforming is safer.
        return true;
    }) : null;

    // However, I can't easily transform variants without seeing exact JSON.
    // Given user wants "MOCK_PRODUCTS replacement", I'll try to keep it simple.
    // If the API returns variants with straightforward attributes or I can assume they do.
    // Let's check ProductController show method: `variantes.valores.atributo`.
    // So distinct attributes are NOT on the variant root.
    // I will write a helper to flatten attributes.

    // Re-writing the effect to flatten attributes for compatibility
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await ProductService.getById(id);

                // Flatten variants attributes
                const flattenedVariants = (data.variantes || []).map(v => {
                    let simpleAttrs = {};
                    if (v.valores && Array.isArray(v.valores)) {
                        v.valores.forEach(val => {
                            if (val.atributo) {
                                simpleAttrs[val.atributo.nombre] = val.valor;
                            }
                        });
                    } else if (v.atributos) {
                        simpleAttrs = v.atributos;
                    }

                    return {
                        ...v,
                        atributos: simpleAttrs
                    };
                });

                const transformedProduct = {
                    ...data,
                    categoria: data.categoria?.nombre || 'Sin categoría',
                    imagenes: (data.imagenes || []).map(img => {
                        const url = typeof img === 'string' ? img : img.url_imagen;
                        return url.startsWith('http') ? url : `${API_URL}${url}`;
                    }),
                    variantes: flattenedVariants
                };

                setProduct(transformedProduct);
            } catch (error) {
                console.error("Error loading product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);


    // 1. Extract all available Attribute Keys (Safe guard)
    const allAttrKeys = product ? Array.from(new Set(
        product.variantes.flatMap(v => Object.keys(v.atributos || {}))
    )) : [];

    // 2. Find matching variant based on current selection
    const activeVariant = product ? product.variantes.find(v => {
        return allAttrKeys.length > 0 && allAttrKeys.every(key => v.atributos[key] === selectedAttrs[key]);
    }) : null;

    useEffect(() => {
        if (product && Object.keys(selectedAttrs).length === 0 && product.variantes.length > 0) {
            // Default to first variant attributes
            setSelectedAttrs(product.variantes[0].atributos || {});
        }
    }, [product]);

    const handleAddToCart = async () => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            Swal.fire({
                title: 'Inicia sesión',
                text: 'Debes estar registrado para comprar',
                icon: 'info',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#00C2CB'
            });
            return;
        }

        if (!activeVariant || activeVariant.stock <= 0) return;

        try {
            await addToCart(activeVariant.id, quantity);

            Swal.fire({
                title: '¡Agregado al carrito!',
                text: `${quantity}x ${product.nombre} (${Object.values(selectedAttrs).join(', ')})`,
                icon: 'success',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#00C2CB',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo agregar al carrito',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        }
    };

    const handleToggleLike = async () => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            Swal.fire({
                title: 'Inicia sesión',
                text: 'Debes estar registrado para dar me gusta',
                icon: 'info',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#00C2CB'
            });
            return;
        }

        try {
            const response = await ProductService.toggleLike(product.id, { usuario_id: user.id });
            setIsLiked(response.liked);
            setLikesCount(prev => response.liked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-sc-navy">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
        </div>
    );

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
            <h2 className="text-2xl font-bold">Producto no encontrado</h2>
            <Link to="/" className="text-sc-cyan mt-4 hover:underline">Volver al inicio</Link>
        </div>
    );

    const currentStock = activeVariant ? activeVariant.stock : 0;
    const basePrice = activeVariant ? activeVariant.precio : (product.variantes[0]?.precio || 0);
    const discount = product.descuento || 0;
    const currentPrice = basePrice * (1 - discount / 100);

    return (
        <div className="max-w-7xl mx-auto pb-20 pt-6">
            {/* Breadcrumb / Back */}
            <div className="flex items-center gap-2 mb-8 text-sm text-slate-400">
                <button onClick={() => navigate(-1)} className="hover:text-sc-cyan flex items-center transition-colors">
                    <ChevronLeft size={16} /> Volver
                </button>
                <span className="text-slate-600">/</span>
                <span className="text-slate-300">{typeof product.categoria === 'object' ? (product.categoria?.nombre || 'Sin categoría') : (product.categoria || 'Sin categoría')}</span>
                <span className="text-slate-600">/</span>
                <span className="truncate max-w-[200px] text-white font-medium">{product.nombre}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

                {/* 1. Image Gallery */}
                <div className="space-y-6">
                    <div className="aspect-[4/5] md:aspect-square bg-sc-navy-card rounded-3xl overflow-hidden border border-white/5 relative group shadow-2xl">
                        <img
                            src={product.imagenes[selectedImage]}
                            alt={product.nombre}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-sc-navy-card/50 to-transparent pointer-events-none" />

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex flex-col gap-3">
                            <button
                                onClick={handleToggleLike}
                                className={`backdrop-blur-md p-3 rounded-full transition-all shadow-lg border border-white/5 group/btn ${isLiked ? 'bg-white text-red-500' : 'bg-sc-navy-card/80 text-slate-300 hover:text-red-500 hover:bg-white'}`}
                            >
                                <Heart size={20} className={isLiked ? "fill-current" : "group-hover/btn:fill-current"} />
                            </button>
                            <button className="bg-sc-navy-card/80 backdrop-blur-md p-3 rounded-full text-slate-300 hover:text-sc-cyan hover:bg-white transition-all shadow-lg border border-white/5">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {product.imagenes.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                            {product.imagenes.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300 ${selectedImage === idx ? 'ring-2 ring-sc-cyan ring-offset-2 ring-offset-sc-navy shadow-lg shadow-sc-cyan/20 scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                    {selectedImage === idx && <div className="absolute inset-0 bg-sc-cyan/10" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Product Info & Selectors */}
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-bold bg-sc-cyan/10 text-sc-cyan px-3 py-1 rounded-full border border-sc-cyan/20 uppercase tracking-wider">
                                {product.marca || 'Marca'}
                            </span>
                            <div className="flex items-center text-yellow-400 text-xs">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14}
                                            fill={i < Math.round(product.calificaciones_avg_rating || 0) ? "currentColor" : "none"}
                                            className={i < Math.round(product.calificaciones_avg_rating || 0) ? "" : "text-slate-600"}
                                        />
                                    ))}
                                </div>
                                <span className="text-slate-500 ml-2 font-medium">({parseFloat(product.calificaciones_avg_rating || 0).toFixed(1)} / {likesCount} likes)</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                            {product.nombre}
                        </h1>

                        {/* Price Block */}
                        <div className="bg-sc-navy-card/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 inline-block w-full">
                            <div className="flex flex-col gap-1">
                                {activeVariant ? (
                                    <div className="flex items-end gap-3">
                                        <Price price={currentPrice} discountPercent={discount} size="xl" />
                                        <span className="text-slate-400 text-sm mb-1.5">Impuest. incl.</span>
                                    </div>
                                ) : (
                                    <span className="text-slate-500 text-2xl font-bold">No disponible</span>
                                )}
                                <p className="text-emerald-400 text-sm mt-2 flex items-center gap-2 font-medium">
                                    <Truck size={16} /> Envío gratis para este producto
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Variant Selectors */}
                    <div className="space-y-6 mb-8 flex-1">
                        {allAttrKeys.map(attrName => (
                            <div key={attrName}>
                                <h4 className="font-bold text-slate-300 text-sm mb-3 flex items-center justify-between">
                                    <span>{attrName}</span>
                                    <span className="text-sc-cyan font-normal">{selectedAttrs[attrName]}</span>
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {Array.from(new Set(product.variantes.map(v => v.atributos[attrName]))).map(value => {
                                        if (!value) return null;
                                        const isSelected = selectedAttrs[attrName] === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setSelectedAttrs(prev => ({ ...prev, [attrName]: value }))}
                                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border
                                                    ${isSelected
                                                        ? 'bg-sc-magenta text-white border-sc-magenta shadow-lg shadow-sc-magenta/25'
                                                        : 'bg-sc-navy-card text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="mb-8 p-6 bg-sc-navy-card/30 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-3 text-lg">Descripción</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {product.descripcion}
                        </p>
                    </div>

                    {/* Stock & Quantity Wrapper */}
                    <div className="space-y-4 pt-6 border-t border-white/10 mt-auto sticky bottom-0 bg-sc-navy/95 backdrop-blur-xl p-4 -mx-4 md:static md:bg-transparent md:p-0">
                        {activeVariant && (
                            <div className="flex items-center gap-2">
                                {currentStock > 10 ? (
                                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                        <ShieldCheck size={14} /> Stock Disponible ({currentStock} uds)
                                    </span>
                                ) : currentStock > 0 ? (
                                    <span className="text-amber-500 text-xs font-bold animate-pulse flex items-center gap-1">
                                        ⚠️ ¡Solo quedan {currentStock} unidades!
                                    </span>
                                ) : (
                                    <span className="text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                        Agotado
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 h-14">
                            {/* Quantity Stepper */}
                            <div className="flex items-center bg-sc-navy-card border border-slate-700 rounded-2xl w-36 justify-between px-2 shadow-inner">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
                                    disabled={!activeVariant || currentStock === 0}
                                >-</button>
                                <span className="font-bold text-white text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
                                    disabled={!activeVariant || quantity >= currentStock}
                                >+</button>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={!activeVariant || currentStock <= 0}
                                className="flex-1 bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-sc-magenta/25 hover:shadow-sc-magenta/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group"
                            >
                                <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                                    <ShoppingCart size={20} className="fill-current" />
                                </div>
                                <span>Agregar al Carrito</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
