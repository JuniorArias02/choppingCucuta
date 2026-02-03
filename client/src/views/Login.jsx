import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import Swal from 'sweetalert2';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: error.response?.data?.message || 'Credenciales incorrectas',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#D9258B'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-sc-magenta/20 rounded-full blur-[80px] z-0 pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-sc-cyan/20 rounded-full blur-[80px] z-0 pointer-events-none"></div>

            <div className="relative z-10 bg-sc-navy-card/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5">
                <div className="text-center mb-10">
                    <div className="inline-block relative w-20 h-20 mb-4 rounded-2xl overflow-hidden shadow-lg shadow-sc-magenta/20">
                        <img src="/logo.jpg" alt="Shopping Cúcuta" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Bienvenido
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Ingresa a tu panel de administración en <span className="text-sc-cyan font-bold">Shopping Cúcuta</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-cyan/20 focus:border-sc-cyan outline-none transition-all placeholder-slate-600"
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-magenta/20 focus:border-sc-magenta outline-none transition-all placeholder-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-magenta/25 hover:shadow-sc-magenta/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="text-center space-y-3">
                        <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors block">
                            ¿Olvidaste tu contraseña?
                        </a>
                        <div className="pt-2 border-t border-white/5">
                            <Link to="/register" className="text-sm text-slate-400 hover:text-white transition-colors">
                                ¿No tienes cuenta? <span className="text-sc-magenta font-bold">Crear Cuenta</span>
                            </Link>
                        </div>
                    </div>
                </form>
            </div>

            <p className="text-center text-slate-600 text-xs mt-8">
                &copy; {new Date().getFullYear()} Shopping Cúcuta. Todos los derechos reservados.
            </p>
        </div>
    );
}
