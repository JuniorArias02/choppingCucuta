import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import Swal from 'sweetalert2';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

export default function Register() {
    const { login } = useAuth(); // We can use login after successful registration
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                background: '#151E32',
                color: '#fff'
            });
            return;
        }

        setLoading(true);
        try {
            // Register
            await AuthService.register(formData);

            // Auto Login
            await login({ email: formData.email, password: formData.password });

            // Redirect based on role (handled by AuthContext/AppLayout, but we can force nav)
            navigate('/');

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al registrarse',
                text: error.response?.data?.message || JSON.stringify(error.response?.data) || 'Ocurrió un error',
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
            <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 bg-sc-cyan/20 rounded-full blur-[80px] z-0 pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-64 h-64 bg-sc-magenta/20 rounded-full blur-[80px] z-0 pointer-events-none"></div>

            <div className="relative z-10 bg-sc-navy-card/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5">
                <div className="text-center mb-8">
                    <div className="inline-block relative w-16 h-16 mb-4 rounded-xl overflow-hidden shadow-lg shadow-sc-cyan/20">
                        <img src="/logo.jpg" alt="Shopping Cúcuta" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Crear Cuenta
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Únete a  <span className="text-sc-cyan font-bold">Shopping Cúcuta</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={20} />
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-sc-cyan/20 focus:border-sc-cyan outline-none transition-all placeholder-slate-600"
                                placeholder="Nombre completo"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={20} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-sc-cyan/20 focus:border-sc-cyan outline-none transition-all placeholder-slate-600"
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={20} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-sc-magenta/20 focus:border-sc-magenta outline-none transition-all placeholder-slate-600"
                                placeholder="Contraseña"
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={20} />
                            <input
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-sc-magenta/20 focus:border-sc-magenta outline-none transition-all placeholder-slate-600"
                                placeholder="Confirmar contraseña"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group bg-gradient-to-r from-sc-cyan to-teal-500 hover:to-teal-400 text-sc-navy font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-cyan/20 hover:shadow-sc-cyan/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                            ¿Ya tienes cuenta? <span className="text-sc-cyan font-bold">Inicia Sesión</span>
                        </Link>
                    </div>
                </form>
            </div>
            <p className="text-center text-slate-600 text-xs mt-8">
                &copy; {new Date().getFullYear()} Shopping Cúcuta
            </p>
        </div>
    );
}
