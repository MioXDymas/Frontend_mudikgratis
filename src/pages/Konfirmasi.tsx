import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, User, AlertTriangle, Loader2 } from 'lucide-react';
import { API } from '../lib/api';

export default function Konfirmasi() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [list, setList] = useState<any[]>([]);
    const [checkedIds, setCheckedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        // Kalau userId di URL beda sama userId login, atau gak ada token, tendang ke login
        const loggedInUser = localStorage.getItem("userId")?.replace(/"/g, "");
        
        if(!token || !loggedInUser) {
            alert("Sesi habis. Silakan login kembali.");
            return navigate("/login");
        }

        try {
            // Kita pakai API Riwayat untuk ambil data keluarga
            const res = await fetch(API.RIWAYAT, { 
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "userId": loggedInUser 
                } 
            });
            
            if (res.ok) {
                const data = await res.json();
                if(Array.isArray(data)) {
                    // Filter: Hanya yang statusnya DITERIMA yang butuh konfirmasi
                    const diterima = data.filter((d:any) => d.status_pendaftaran === 'DITERIMA');
                    
                    if (diterima.length === 0) {
                        alert("Tidak ada data yang perlu dikonfirmasi saat ini.");
                        return navigate("/dashboard");
                    }

                    setList(diterima);
                    // Default: Semua dicentang (Hadir Semua)
                    setCheckedIds(diterima.map((d:any) => d.pendaftaran_id));
                }
            } else {
                console.error("Gagal load data riwayat");
            }
        } catch (error) {
            console.error("Error connection:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheck = (id: number) => {
        if(checkedIds.includes(id)) {
            setCheckedIds(checkedIds.filter(cid => cid !== id)); // Uncheck (Batal)
        } else {
            setCheckedIds([...checkedIds, id]); // Check (Jadi Ikut)
        }
    };

    const handleSubmit = async () => {
        const batalCount = list.length - checkedIds.length;
        const confirmMsg = batalCount > 0 
            ? `PERHATIAN: Anda akan membatalkan ${batalCount} orang anggota keluarga. Kursi mereka akan diberikan ke orang lain. Lanjut?`
            : `Konfirmasi kehadiran untuk ${checkedIds.length} orang?`;

        if(!confirm(confirmMsg)) return;

        setSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            // 🔥 FIX URL: Gunakan API.PENDAFTARAN sebagai base path
            const url = `${API.PENDAFTARAN}/konfirmasi-kehadiran/${userId}`;

            const res = await fetch(url, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ ids_konfirmasi: checkedIds })
            });

            const json = await res.json();

            if(res.ok) {
                alert(`✅ Sukses! ${json.message || "Konfirmasi berhasil disimpan."}`);
                navigate('/dashboard');
            } else {
                alert(`❌ Gagal: ${json.error || json.message || "Terjadi kesalahan."}`);
            }
        } catch (error) {
            console.error(error);
            alert("❌ Gagal menghubungi server. Periksa koneksi internet.");
        } finally {
            setSubmitting(false);
        }
    };

    if(loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 gap-2">
                <Loader2 className="animate-spin" /> Memuat data konfirmasi...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-center font-sans">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold mb-1">Konfirmasi Kehadiran</h1>
                    <p className="text-blue-100 text-sm">Wajib diisi H-3 Keberangkatan</p>
                </div>

                <div className="p-8">
                    <p className="text-slate-600 text-sm mb-6 text-center leading-relaxed">
                        Mohon ceklist nama anggota keluarga yang <strong>PASTI BERANGKAT</strong>. 
                        <br/>
                        <span className="text-red-500 font-bold">PENTING:</span> Nama yang tidak dicentang otomatis dianggap <span className="text-red-600 font-bold underline">BATAL</span>.
                    </p>

                    <div className="space-y-3 mb-8">
                        {list.map(p => {
                            const isChecked = checkedIds.includes(p.pendaftaran_id);
                            return (
                                <div key={p.pendaftaran_id} 
                                     onClick={() => handleCheck(p.pendaftaran_id)}
                                     className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all duration-200 group
                                     ${isChecked 
                                        ? "border-green-500 bg-green-50 shadow-sm" 
                                        : "border-slate-200 bg-slate-50 opacity-60 hover:opacity-80"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isChecked ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"}`}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className={`font-bold ${isChecked ? "text-slate-800" : "text-slate-500 line-through"}`}>{p.nama_peserta}</p>
                                            <p className="text-xs text-slate-500 font-mono">{p.nik_peserta}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="transform transition-transform group-hover:scale-110">
                                        {isChecked 
                                            ? <CheckCircle className="text-green-600 fill-green-100" size={28} />
                                            : <XCircle className="text-slate-400" size={28} />
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl text-xs text-amber-800 mb-8 border border-amber-100">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <p>
                            <strong>Perhatian:</strong> Data yang sudah Anda batalkan (tidak dicentang) tidak dapat dipulihkan kembali. Kursi akan dialihkan ke pendaftar lain.
                        </p>
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin"/> : "Simpan Konfirmasi"}
                    </button>
                    
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full mt-3 text-slate-400 text-sm font-medium hover:text-slate-600 py-2"
                    >
                        Batal & Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}