import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, User, AlertTriangle } from 'lucide-react';
import { API } from '../lib/api';

export default function Konfirmasi() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [list, setList] = useState<any[]>([]);
    const [checkedIds, setCheckedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kita "numpang" API riwayat tapi filter di frontend atau 
        // idealnya bikin API GET khusus public, tapi pakai trick login admin/user token sementara
        // Demi simpel, kita pakai fetch data user biasa (asumsi user login)
        fetchData();
    }, []);

    const fetchData = async () => {
        // Note: User harus login dulu biar aman, atau backendnya dibikin public
        // Kalau mau public tanpa login, endpoint backend get-nya harus @PermitAll
        const token = localStorage.getItem("token");
        if(!token) return alert("Silakan login dulu untuk konfirmasi");

        const res = await fetch(`${API.RIWAYAT}`, { // Pake API Riwayat yg udah ada
            headers: { Authorization: `Bearer ${token}`, userId: userId || "" } 
        });
        const data = await res.json();
        if(Array.isArray(data)) {
            // Cuma ambil yang DITERIMA
            const diterima = data.filter((d:any) => d.status_pendaftaran === 'DITERIMA');
            setList(diterima);
            // Default semua ke-ceklist
            setCheckedIds(diterima.map((d:any) => d.pendaftaran_id));
        }
        setLoading(false);
    };

    const handleCheck = (id: number) => {
        if(checkedIds.includes(id)) {
            setCheckedIds(checkedIds.filter(cid => cid !== id)); // Uncheck
        } else {
            setCheckedIds([...checkedIds, id]); // Check
        }
    };

    const handleSubmit = async () => {
        const batalCount = list.length - checkedIds.length;
        if(!confirm(`Anda akan mengkonfirmasi ${checkedIds.length} orang dan MEMBATALKAN ${batalCount} orang. Lanjut?`)) return;

        const token = localStorage.getItem("token");
        // Endpoint baru yang kita buat di atas (Manual add ke api.ts nanti)
        const res = await fetch(`${API.BASE_URL}/api/pendaftaran/konfirmasi-kehadiran/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ids_konfirmasi: checkedIds })
        });

        if(res.ok) {
            alert("Terima kasih! Konfirmasi berhasil.");
            navigate('/dashboard');
        } else {
            alert("Gagal konfirmasi.");
        }
    };

    if(loading) return <div className="p-10 text-center">Memuat data...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Konfirmasi Kehadiran</h1>
                <p className="text-slate-500 text-sm mb-6">
                    H-3 Keberangkatan. Harap ceklist nama yang <strong>PASTI BERANGKAT</strong>. 
                    Yang tidak dicentang akan otomatis <strong>DIBATALKAN</strong>.
                </p>

                <div className="space-y-3 mb-8">
                    {list.map(p => (
                        <div key={p.pendaftaran_id} 
                             onClick={() => handleCheck(p.pendaftaran_id)}
                             className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition
                             ${checkedIds.includes(p.pendaftaran_id) 
                                ? "border-green-500 bg-green-50" 
                                : "border-slate-200 bg-slate-50 opacity-60"}`}
                        >
                            <div className="flex items-center gap-3">
                                <User className={checkedIds.includes(p.pendaftaran_id) ? "text-green-600" : "text-slate-400"} />
                                <div>
                                    <p className="font-bold text-slate-800">{p.nama_peserta}</p>
                                    <p className="text-xs text-slate-500">{p.nik_peserta}</p>
                                </div>
                            </div>
                            {checkedIds.includes(p.pendaftaran_id) 
                                ? <CheckCircle className="text-green-600" />
                                : <XCircle className="text-slate-400" />
                            }
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-700 mb-6">
                    <AlertTriangle size={24} />
                    <p>Perhatian: Data yang sudah dibatalkan tidak dapat dikembalikan lagi.</p>
                </div>

                <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg">
                    Simpan Konfirmasi
                </button>
            </div>
        </div>
    );
}