import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Daftar" />
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-8" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-[#0f172a]">Buat Akun Baru</h1>
                        <p className="text-sm text-[#64748b] mt-2">Daftar untuk mengakses sistem akreditasi UMRAH</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-[#0f172a] mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#0f172a] mb-2">
                                    Email UMRAH
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                                    placeholder="nama@umrah.ac.id"
                                    required
                                />
                                <p className="mt-1 text-xs text-[#64748b]">
                                    Hanya email dengan domain @umrah.ac.id yang dapat digunakan
                                </p>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[#0f172a] mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                                    placeholder="Minimal 8 karakter"
                                    required
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-[#0f172a] mb-2">
                                    Konfirmasi Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0f172a] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                                    placeholder="Ulangi password"
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E4ED0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Mendaftar...' : 'Daftar'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-[#64748b]">
                                Sudah punya akun?{' '}
                                <Link href="/login" className="text-[#2563EB] hover:text-[#1E4ED0] font-medium">
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-[#64748b] hover:text-[#2563EB] transition-colors">
                            ← Kembali ke beranda
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

