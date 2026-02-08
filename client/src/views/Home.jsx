import { useState, useEffect } from 'react';
import ProductCard from '../components/products/ProductCard';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import { Sparkles, ArrowRight, Zap, Smartphone, Shirt, Home as HomeIcon, Dumbbell, Gamepad2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    ProductService.getAll(),
                    CategoryService.getAll({ has_products: true })
                ]);

                // Handle pagination or flat array
                const prods = productsData.data?.length !== undefined ? productsData.data : (Array.isArray(productsData) ? productsData : []);
                setProducts(prods);
                setFilteredProducts(prods);
                setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []));
            } catch (error) {
                console.error("Error fetching home data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getCategoryIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('tecno') || n.includes('celular') || n.includes('comput')) return <Smartphone size={32} />;
        if (n.includes('moda') || n.includes('ropa') || n.includes('camis')) return <Shirt size={32} />;
        if (n.includes('hogar') || n.includes('casa') || n.includes('decor')) return <HomeIcon size={32} />;
        if (n.includes('deport') || n.includes('fit') || n.includes('gym')) return <Dumbbell size={32} />;
        if (n.includes('juguet') || n.includes('game') || n.includes('niñ')) return <Gamepad2 size={32} />;
        return <Tag size={32} />;
    };

    const handleCategoryClick = (categoryId) => {
        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
            setFilteredProducts(products); // Reset
        } else {
            setSelectedCategory(categoryId);
            setFilteredProducts(products.filter(p => p.categoria_id === categoryId));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Hero / Promo Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-sc-navy-card border border-white/5 h-[28rem] md:h-[32rem] flex items-center px-8 md:px-16 group">
                {/* Background Gradient Mesh */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-sc-magenta/20 to-sc-purple/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-sc-cyan/10 to-transparent rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 opacity-40"></div>

                <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sc-cyan opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sc-cyan"></span>
                        </span>
                        <span className="text-xs font-bold text-sc-cyan tracking-wider uppercase">Nueva Colección 2026</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                        Tecnología que <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sc-magenta via-purple-500 to-sc-cyan animate-gradient-x">Inspira</span>
                    </h2>

                    <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                        Descubre lo último en gadgets, accesorios y estilo de vida con la calidad y garantía de Shopping Cúcuta.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link to="/products?ofertas=true" className="bg-sc-magenta hover:bg-pink-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-sc-magenta/25 hover:shadow-sc-magenta/40 hover:-translate-y-1 transition-all flex items-center gap-2">
                            Ver Ofertas <Zap size={20} fill="currentColor" />
                        </Link>
                        <Link to="/products" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl backdrop-blur-sm transition-all flex items-center gap-2">
                            Explorar Todo <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>

                {/* Floating Elements (Decorative) */}
                <div className="absolute top-10 right-20 hidden lg:block animate-float-slow">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 flex items-center justify-center rotate-12 shadow-xl">
                        <Zap size={40} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Categories - Horizontal Scroll */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="p-2 rounded-lg bg-sc-cyan/10 text-sc-cyan">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="font-bold text-white text-2xl tracking-tight">
                        Categorías Populares
                    </h3>
                </div>

                {categories.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-2">
                        {/* 'Todas' Option */}
                        <div
                            onClick={() => handleCategoryClick(null)}
                            className={`flex flex-col items-center gap-3 min-w-[100px] group cursor-pointer p-4 rounded-2xl transition-all duration-300 ${!selectedCategory ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            <div className={`w-20 h-20 rounded-full bg-sc-navy-card border ${!selectedCategory ? 'border-sc-cyan shadow-[0_0_20px_rgba(0,194,203,0.3)]' : 'border-slate-700'} flex items-center justify-center text-sc-cyan group-hover:scale-110 group-hover:border-sc-cyan group-hover:shadow-[0_0_20px_rgba(0,194,203,0.3)] transition-all duration-300 relative z-10`}>
                                <Sparkles size={32} />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${!selectedCategory ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                Todas
                            </span>
                        </div>

                        {categories.filter(c => !c.parent_id).map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`flex flex-col items-center gap-3 min-w-[100px] group cursor-pointer p-4 rounded-2xl transition-all duration-300 ${selectedCategory === cat.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-20 h-20 rounded-full bg-sc-navy-card border ${selectedCategory === cat.id ? 'border-sc-cyan shadow-[0_0_20px_rgba(0,194,203,0.3)]' : 'border-slate-700'} flex items-center justify-center text-sc-cyan group-hover:scale-110 group-hover:border-sc-cyan group-hover:shadow-[0_0_20px_rgba(0,194,203,0.3)] transition-all duration-300 relative z-10`}>
                                    <span className="drop-shadow-lg filter">{getCategoryIcon(cat.nombre)}</span>
                                </div>
                                <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                    {cat.nombre}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        Cargando categorías...
                    </div>
                )}
            </div>

            {/* Product Grid */}
            <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                    <div>
                        <h3 className="font-bold text-white text-2xl tracking-tight mb-1">
                            Recomendado para ti
                        </h3>
                        <p className="text-slate-500 text-sm">Selección exclusiva basada en tus gustos</p>
                    </div>
                    <Link to="/products" className="text-sc-cyan text-sm font-bold hover:text-white transition-colors flex items-center gap-1">
                        Ver todo <ArrowRight size={16} />
                    </Link>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center bg-sc-navy-card/30 rounded-2xl border border-white/5">
                        <p className="text-slate-400">No hay productos destacados por el momento.</p>
                        <Link to="/admin/create-product" className="text-sc-cyan hover:underline mt-2 inline-block">
                            ¡Crea el primero!
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
