import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, Bus, MapPin, FileSpreadsheet, LogOut, 
    ArrowRight, Activity, Map 
} from 'lucide-react';
import { AdminAPI, API } from '../lib/api'; 
import PetaSebaran from '../components/PetaSebaran';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, verif: 0, terima: 0 });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/admin/login'); return; }
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await AdminAPI.getPendaftar();
            if (Array.isArray(res)) {
                setStats({
                    total: res.length,
                    verif: res.filter((d: any) => d.status === 'MENUNGGU_VERIFIKASI').length,
                    terima: res.filter((d: any) => d.status === 'DITERIMA').length,
                });
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            {/* HEADER */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500">Pusat Kontrol Mudik Gratis 2026</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => window.open(API.EXPORT, '_blank')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                        <FileSpreadsheet size={18}/> Export Excel
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate('/admin/login'); }} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-50">
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </header>

            {/* MENU NAVIGASI UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* 1. VERIFIKASI */}
                <div 
                    onClick={() => navigate('/admin/verifikasi')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:bg-blue-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24}/></div>
                            <h3 className="text-lg font-bold text-slate-800">Verifikasi</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Cek data, plotting bus, & WA.</p>
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            {stats.total} Pendaftar <ArrowRight size={16}/>
                        </div>
                    </div>
                </div>

                {/* 2. MANAJEMEN BUS */}
                <div 
                    onClick={() => navigate('/admin/kendaraan')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:bg-purple-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Bus size={24}/></div>
                            <h3 className="text-lg font-bold text-slate-800">Armada Bus</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Atur bus & kapasitas kursi.</p>
                        <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                            Kelola Armada <ArrowRight size={16}/>
                        </div>
                    </div>
                </div>

                {/* 3. MANAJEMEN RUTE (SAYA TAMBAHKAN INI) */}
                <div 
                    onClick={() => navigate('/admin/rute')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:bg-orange-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Map size={24}/></div>
                            <h3 className="text-lg font-bold text-slate-800">Rute & Jadwal</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Atur tujuan & waktu berangkat.</p>
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                            Kelola Rute <ArrowRight size={16}/>
                        </div>
                    </div>
                </div>

            </div>

            {/* STATISTIK RINGKAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-slate-100 text-slate-600"><Activity size={20}/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Masuk</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600"><Users size={20}/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Perlu Verifikasi</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.verif}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100 text-green-600"><Bus size={20}/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Siap Berangkat</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.terima}</p>
                    </div>
                </div>
            </div>

            {/* PETA SEBARAN */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wide">
                    <MapPin size={14}/> Peta Sebaran Pemudik
                </div>
                <div className="h-[400px] w-full relative z-0">
                    <PetaSebaran />
                </div>
            </div>
        </div>
    );
}