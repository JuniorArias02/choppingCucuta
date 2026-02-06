import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import { Mail, Key, ShieldCheck, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function PasswordReset() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);

    // Alert Helper
    const showAlert = (icon, title, text) => {
        Swal.fire({
            icon,
            title,
            text,
            background: '#151E32',
            color: '#fff',
            confirmButtonColor: '#D9258B'
        });
    };

    // Paso 1: Enviar Código
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await AuthService.sendRecoveryCode(email);
            setStep(2);
            showAlert('success', '¡Código Enviado!', `Hemos enviado un código de recuperación a ${ email } `);
        } catch (err) {
            showAlert('error', 'Error', err.response?.data?.message || 'No pudimos enviar el código.');
        } finally {
            setLoading(false);
        }
    };

    // Paso 3: Verificar y Cambiar Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (password !== passwordConfirmation) {
            showAlert('error', 'Error', 'Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const response = await AuthService.resetPassword({
                email,
                code,
                password,
                password_confirmation: passwordConfirmation
            });

            // Éxito
            const { access_token } = response;
            localStorage.setItem('ACCESS_TOKEN', access_token);

            await Swal.fire({
                icon: 'success',
                title: '¡Contraseña Restablecida!',
                text: 'Has recuperado el acceso a tu cuenta.',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#D9258B',
                timer: 2000,
                showConfirmButton: false
            });

            window.location.href = '/';

        } catch (err) {
            showAlert('error', 'Error', err.response?.data?.message || 'Código inválido o expirado.');
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
                    <div className="inline-flex items-center justify-center relative w-20 h-20 mb-4 rounded-2xl bg-sc-navy/50 border border-white/10 shadow-lg shadow-sc-magenta/20">
                        {step === 1 && <Mail size={40} className="text-sc-cyan" />}
                        {step === 2 && <ShieldCheck size={40} className="text-sc-magenta" />}
                        {step === 3 && <Key size={40} className="text-green-400" />}
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {step === 1 && 'Recuperar Cuenta'}
                        {step === 2 && 'Código Enviado'}
                        {step === 3 && 'Nueva Contraseña'}
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        {step === 1 && 'Ingresa tu correo para recibir un código.'}
                        {step === 2 && `Ingresa el código que enviamos a ${ email } `}
                        {step === 3 && 'Crea una contraseña segura.'}
                    </p>
                </div>

                {/* Paso 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-6">
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group bg-gradient-to-r from-sc-cyan to-blue-600 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-cyan/25 hover:shadow-sc-cyan/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Enviando...' : 'Enviar Código'}
                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                )}

                {/* Paso 2: Transición / Ingreso Código manual si no redirige */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setStep(3)}
                                className="w-full group bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-magenta/25 hover:shadow-sc-magenta/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Tengo el Código
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full bg-transparent border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold py-3 px-4 rounded-xl transition-all duration-300"
                            >
                                Cambiar Correo
                            </button>
                        </div>
                        <div className="text-center">
                            <button onClick={handleSendCode} className="text-xs text-sc-cyan hover:underline">
                                ¿No llegó? Reenviar código
                            </button>
                        </div>
                    </div>
                )}

                {/* Paso 3: Nueva Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder-slate-600 tracking-widest text-center"
                                    placeholder="CÓDIGO (6 dígitos)"
                                    maxLength={6}
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
                                    placeholder="Nueva contraseña"
                                    minLength={8}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-magenta/20 focus:border-sc-magenta outline-none transition-all placeholder-slate-600"
                                    placeholder="Confirmar contraseña"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group bg-gradient-to-r from-green-500 to-emerald-600 hover:to-emerald-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                )}

                <div className="text-center mt-8 pt-6 border-t border-white/5">
                    <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                        ← Volver al Login
                    </Link>
                </div>
            </div>

            <p className="text-center text-slate-600 text-xs mt-8">
                &copy; {new Date().getFullYear()} Shopping Cúcuta. Seguridad garantizada.
            </p>
        </div>
    );
}

