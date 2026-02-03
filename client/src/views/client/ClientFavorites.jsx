import { useState, useEffect } from 'react';
import api from '../../api/axios';
import ProductCard from '../../components/products/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientFavorites() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        try {
            const response = await api.get('/favorites');
            // Check if response is paginated (has data property) or flat array
            const data = response.data.data ? response.data.data : (Array.isArray(response.data) ? response.data : []);
            setProducts(data);
        } catch (error) {
            console.error("Error loading favorites", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-sc-navy-card/50 rounded-3xl border border-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Heart size={40} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No tienes favoritos aún</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-8">
                    Guarda los productos que más te gusten para encontrarlos fácilmente después.
                </p>
                <Link to="/" className="px-6 py-3 bg-sc-cyan text-sc-navy font-bold rounded-xl hover:bg-cyan-300 transition-colors flex items-center gap-2">
                    Explorar Productos <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Heart className="text-sc-magenta fill-sc-magenta" /> Mis Favoritos
                </h1>
                <p className="text-slate-400">Tus productos guardados.</p>
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {products.map(product => (
                    <div key={product.id} className="break-inside-avoid">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
