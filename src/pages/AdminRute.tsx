import React, { useEffect, useState } from 'react';
import { 
    MapPin, Calendar, Users, Edit, Trash2, Plus, X, Save, Clock, ArrowRight 
} from 'lucide-react';
import { API } from '../lib/api';

export default function AdminRute() {
    const [rutes, setRutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    // Form State
    const [form, setForm] = useState({
        rute_id: null,
        asal: 'Banda Aceh',
        tujuan: '',
        kuota_total: 0,
        tanggal_keberangkatan: '' // String ISO
    });

    useEffect(() => {
        loadRutes();
    }, []);

    const loadRutes = async () => {
        try {
            const res = await fetch(API.RUTE); 
            const data = await res.json();
            setRutes(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if(!confirm("Hapus rute ini? Data akan hilang permanen!")) return;
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API.RUTE}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if(res.ok) {
            alert("Rute dihapus");
            loadRutes();
        } else {
            alert("Gagal hapus");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        // Format Tanggal untuk Backend Java (ISO String)
        const payload = {
            ...form,
            tanggal_keberangkatan: form.tanggal_keberangkatan 
                ? new Date(form.tanggal_keberangkatan).toISOString().slice(0, 19) 
                : null
        };

        const url = isEdit ? `${API.RUTE}/${form.rute_id}` : API.RUTE;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            alert("Berhasil disimpan!");
            setShowModal(false);
            loadRutes();
        } else {
            alert("Gagal menyimpan rute");
        }
    };

    const openEdit = (r: any) => {
        // Konversi Tanggal dari Backend ke Input HTML
        // Backend kirim array [2026, 4, 15, 8, 0] ATAU String ISO tergantung JSONB
        let tglString = "";
        
        if(r.tanggal_raw) {
            if(Array.isArray(r.tanggal_raw)) {
                // Jika format Array [YYYY, MM, DD, HH, mm]
                const [y, m, d, h, min] = r.tanggal_raw;
                const pad = (n:number) => n.toString().padStart(2, '0');
                tglString = `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}`;
            } else {
                // Jika format String ISO
                tglString = r.tanggal_raw.toString().slice(0,16); 
            }
        }

        setForm({
            rute_id: r.rute_id,
            asal: r.asal,
            tujuan: r.tujuan,
            kuota_total: r.kuota_total,
            tanggal_keberangkatan: tglString
        });
        setIsEdit(true);
        setShowModal(true);
    };

    const openAdd = () => {
        setForm({
            rute_id: null,
            asal: 'Banda Aceh',
            tujuan: '',
            kuota_total: 40,
            tanggal_keberangkatan: ''
        });
        setIsEdit(false);
        setShowModal(true);
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Rute</h1>
                    <p className="text-slate-500 text-sm">Kelola tujuan dan jadwal keberangkatan.</p>
                </div>
                <button onClick={openAdd} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    <Plus size={20}/> Tambah Rute
                </button>
            </div>

            {/* TABEL RUTE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b">
                        <tr>
                            <th className="px-6 py-4">Tujuan</th>
                            <th className="px-6 py-4">Jadwal</th>
                            <th className="px-6 py-4 text-center">Kuota (Isi/Total)</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">Memuat data...</td></tr> : 
                        rutes.map((r) => (
                            <tr key={r.rute_id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                                            <MapPin size={20}/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                                {r.asal} <ArrowRight size={14} className="text-slate-400"/> {r.tujuan}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">ID: {r.rute_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg w-fit border border-slate-100">
                                        <Calendar size={16} className="text-orange-500"/>
                                        <span className="font-medium">
                                            {r.waktu_berangkat}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                            Isi: {r.kuota_terisi}
                                        </span>
                                        <span className="text-slate-300">/</span>
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                                            Total: {r.kuota_total}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEdit(r)} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition border border-yellow-100"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(r.rute_id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-100"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rutes.length === 0 && !loading && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">Belum ada rute tersedia.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition"><X size={20}/></button>
                        
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Rute" : "Buat Rute Baru"}</h2>
                            <p className="text-xs text-slate-500">Pastikan data tujuan dan jadwal benar.</p>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Kota Asal</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" value={form.asal} onChange={e => setForm({...form, asal: e.target.value})} required/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Kota Tujuan</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" value={form.tujuan} onChange={e => setForm({...form, tujuan: e.target.value})} placeholder="Contoh: Medan" required/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Waktu Keberangkatan</label>
                                <input type="datetime-local" className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" value={form.tanggal_keberangkatan} onChange={e => setForm({...form, tanggal_keberangkatan: e.target.value})} required/>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Total Kuota (Manual Override)</label>
                                <input type="number" className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" value={form.kuota_total} onChange={e => setForm({...form, kuota_total: parseInt(e.target.value)})} required/>
                                <p className="text-[10px] text-slate-400 mt-1 italic">*Biasanya otomatis dari jumlah Bus, tapi bisa diubah manual disini.</p>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 mt-4 flex justify-center items-center gap-2 transition active:scale-95">
                                <Save size={18}/> Simpan Data
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}