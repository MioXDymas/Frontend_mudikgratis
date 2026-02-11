import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Trash2, Plus, ArrowLeft, Phone, User } from 'lucide-react';
import { API, UserAPI } from '../lib/api';

// Sesuaikan interface dengan Model Java terbaru
interface BusData {
    id: number;
    nama_armada: string;
    jenis_kendaraan: string;
    plat_nomor: string;
    kapasitas_total: number;
    terisi: number;
    nama_supir?: string;   // Tambahan sesuai Model
    kontak_supir?: string; // Tambahan sesuai Model
}

export default function AdminKendaraan() {
    const navigate = useNavigate();
    const [rutes, setRutes] = useState<any[]>([]);
    const [selectedRute, setSelectedRute] = useState<string>(""); 
    const [buses, setBuses] = useState<BusData[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State (Lengkap Sesuai Model)
    const [form, setForm] = useState({
        nama_armada: "",
        jenis_kendaraan: "BUS BESAR",
        plat_nomor: "",
        kapasitas_total: 40,
        nama_supir: "",       // Baru
        kontak_supir: ""      // Baru
    });

    useEffect(() => {
        loadRutes();
        loadBuses(""); // Load semua bus pas awal
    }, []);

    const loadRutes = async () => {
        try {
            const res = await UserAPI.getRute();
            setRutes(res);
        } catch (e) { console.error(e); }
    };

    const loadBuses = async (ruteIdVal: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = ruteIdVal 
                ? `${API.ADMIN_KENDARAAN}?rute_id=${ruteIdVal}` 
                : API.ADMIN_KENDARAAN;
                
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error("Gagal load data");
            
            const data = await res.json();
            setBuses(Array.isArray(data) ? data : []);
        } catch (e) { 
            console.error(e);
            // alert("Gagal memuat data bus"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleRuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedRute(val);
        loadBuses(val);
    };

    const handleDelete = async (id: number) => {
        if(!confirm("Hapus bus ini? Kuota rute akan berkurang otomatis!")) return;
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API.ADMIN_KENDARAAN}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            loadBuses(selectedRute);
        } catch (e) { alert("Gagal hapus"); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedRute) return alert("Wajib pilih Rute dulu di atas!");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API.ADMIN_KENDARAAN}?rute_id=${selectedRute}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(form)
            });
            
            if(res.ok) {
                alert("✅ Bus Berhasil Ditambahkan!");
                // Reset Form
                setForm({ 
                    nama_armada: "", jenis_kendaraan: "BUS BESAR", plat_nomor: "", 
                    kapasitas_total: 40, nama_supir: "", kontak_supir: "" 
                }); 
                loadBuses(selectedRute);
            } else {
                const json = await res.json();
                alert("Gagal: " + (json.error || "Cek koneksi"));
            }
        } catch (e) { alert("Error koneksi"); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bus className="text-purple-600"/> Manajemen Armada
                    </h1>
                    <p className="text-slate-500 text-sm">Tambah & Atur Bus per Rute</p>
                </div>
                <button onClick={() => navigate('/admin/verifikasi')} className="bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-100">
                    <ArrowLeft size={16}/> Kembali ke Verifikasi
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* === KOLOM KIRI: FORM INPUT === */}
                <div className="md:col-span-1 space-y-6">
                    {/* FILTER RUTE (PENTING BUAT NAMBAH BUS) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Pilih Rute Tujuan (Wajib)</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                            value={selectedRute}
                            onChange={handleRuteChange}
                        >
                            <option value="">-- Pilih Rute Dulu --</option>
                            {rutes.map((r: any) => (
                                <option key={r.rute_id} value={r.rute_id}>{r.tujuan} (Berangkat: {r.waktu_berangkat})</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-2 italic">*Bus yang ditambah akan masuk ke rute ini.</p>
                    </div>

                    {/* FORM BUS */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Plus size={18}/> 2. Data Bus Baru</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500">Nama PO / Bus</label>
                                <input required type="text" className="w-full p-2 border rounded" placeholder="Contoh: Sempati Star 01" 
                                    value={form.nama_armada} onChange={e => setForm({...form, nama_armada: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Plat Nomor</label>
                                    <input required type="text" className="w-full p-2 border rounded" placeholder="BL 1234 AA" 
                                        value={form.plat_nomor} onChange={e => setForm({...form, plat_nomor: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Kapasitas</label>
                                    <input required type="number" className="w-full p-2 border rounded" 
                                        value={form.kapasitas_total} onChange={e => setForm({...form, kapasitas_total: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500">Jenis Kendaraan</label>
                                <select className="w-full p-2 border rounded" 
                                    value={form.jenis_kendaraan} onChange={e => setForm({...form, jenis_kendaraan: e.target.value})}>
                                    <option value="BUS BESAR">BUS BESAR (40-50 Seat)</option>
                                    <option value="BUS SEDANG">BUS SEDANG (25-30 Seat)</option>
                                    <option value="MINIBUS">HIACE / ELF (10-15 Seat)</option>
                                </select>
                            </div>

                            {/* INPUT SUPIR (BARU) */}
                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <label className="text-xs font-bold text-slate-400 block mb-2">Info Supir (Opsional)</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-slate-400"/>
                                        <input type="text" className="w-full p-2 border rounded text-sm" placeholder="Nama Supir"
                                            value={form.nama_supir} onChange={e => setForm({...form, nama_supir: e.target.value})} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-slate-400"/>
                                        <input type="text" className="w-full p-2 border rounded text-sm" placeholder="No HP Supir"
                                            value={form.kontak_supir} onChange={e => setForm({...form, kontak_supir: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={!selectedRute} className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed transition">
                                {selectedRute ? "+ Simpan Bus" : "Pilih Rute Dulu ☝️"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* === KOLOM KANAN: TABEL BUS === */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-600 flex justify-between items-center">
                        <span>Daftar Armada {selectedRute ? "(Sesuai Rute)" : "(Semua Rute)"}</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-500">Total: {buses.length} Unit</span>
                    </div>
                    
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-xs uppercase text-slate-500 sticky top-0">
                                <tr>
                                    <th className="p-4">Armada & Plat</th>
                                    <th className="p-4">Supir & Kontak</th>
                                    <th className="p-4 text-center">Kapasitas</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">Sedang memuat data...</td></tr> : 
                                buses.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada bus. Silakan pilih rute dan tambah bus baru.</td></tr> :
                                buses.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{b.nama_armada}</div>
                                            <div className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-1 rounded mt-1">{b.plat_nomor}</div>
                                            <div className="text-[10px] text-purple-600 font-bold mt-1">{b.jenis_kendaraan}</div>
                                        </td>
                                        <td className="p-4">
                                            {b.nama_supir ? (
                                                <>
                                                    <div className="text-slate-700 font-medium flex items-center gap-1"><User size={12}/> {b.nama_supir}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Phone size={12}/> {b.kontak_supir || "-"}</div>
                                                </>
                                            ) : <span className="text-slate-300 italic text-xs">Belum ada data</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="font-bold text-lg text-slate-700">
                                                <span className={b.terisi >= b.kapasitas_total ? "text-red-500" : "text-green-600"}>
                                                    {b.terisi}
                                                </span> 
                                                <span className="text-slate-400 text-sm"> / {b.kapasitas_total}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 uppercase">Kursi Terisi</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(b.id)} 
                                                className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition" 
                                                title="Hapus Bus"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}