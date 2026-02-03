import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Price from '../ui/Price';

export default function ProductCard({ product }) {
    // Logic to find lowest price
    const totalStock = product.variantes.reduce((acc, v) => acc + v.stock, 0);
    const outOfStock = totalStock === 0;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/400x500?text=No+Image';
        const url = typeof img === 'string' ? img : img.url_imagen;
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    const displayImage = getImageUrl(product.imagenes?.[0]);

    // Use real discount
    const discount = product.descuento || 0;

    // Calculate price with discount
    const lowestBasePrice = Math.min(...product.variantes.map(v => v.precio));
    const finalPrice = lowestBasePrice * (1 - discount / 100);

    return (
        <Link
            to={`/product/${product.id}`}
            className="group bg-sc-navy-card rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full relative hover:-translate-y-1 hover:border-sc-cyan/30 hover:shadow-2xl hover:shadow-sc-cyan/10 transition-all duration-300"
        >
            {/* Discount Badge */}
            {!outOfStock && discount > 0 && (
                <div className="absolute top-3 left-3 bg-sc-magenta text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 shadow-lg">
                    -{discount}%
                </div>
            )}

            {/* Image Container */}
            <div className="aspect-[4/5] overflow-hidden bg-sc-navy relative">
                <img
                    src={displayImage}
                    alt={product.nombre}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${outOfStock ? 'opacity-40 grayscale' : 'opacity-90 group-hover:opacity-100'}`}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-sc-navy-card/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <span className="bg-white text-sc-navy text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl transform -rotate-6">
                            Agotado
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow relative z-10">
                <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-sc-cyan/80 tracking-wider mb-1 block">
                        {product.marca}
                    </span>
                    <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 leading-relaxed group-hover:text-sc-cyan transition-colors duration-300">
                        {product.nombre}
                    </h3>
                </div>

                <div className="mt-auto pt-3 border-t border-white/5 space-y-2">
                    <Price price={finalPrice} discountPercent={discount} className="text-white" />

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Envío Gratis
                        </span>
                        {discount > 20 && (
                            <span className="text-[10px] text-sc-magenta bg-sc-magenta/10 px-2 py-0.5 rounded border border-sc-magenta/20 font-bold animate-pulse">
                                🔥 Oferta
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
