import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, CheckCircle, XCircle, Clock, LogOut, Printer, 
    RefreshCw, Trash2, ChevronDown, ChevronUp, Bus, Users, Filter, MoreHorizontal, 
    Send, MessageCircle, AlertTriangle, MapPin, Undo2
} from 'lucide-react';
import { AdminAPI, API, BASE_URL } from '../lib/api'; 

// --- TYPES ---
interface Pendaftar {
    id: number;
    nama_peserta: string;
    nik_peserta: string;
    no_hp_target: string;
    jenis_kelamin: string;
    kategori: string;
    rute_tujuan: string;
    tgl_berangkat: string; 
    nama_bus: string;
    foto_bukti: string;
    status: string;
    kode_booking: string;
    id_keluarga: number;
    nama_kepala_keluarga: string;
    link_wa_terima?: string;
    link_wa_tolak?: string;
    link_wa_verif?: string;
}

// --- GROUPING HELPER ---
const groupData = (data: Pendaftar[]) => {
    const groups: Record<number, Pendaftar[]> = {};
    data.forEach(item => {
        const key = item.id_keluarga || item.id;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    });
    return groups;
};

export default function AdminPendaftar() {
    const navigate = useNavigate();
    
    // State Data
    const [data, setData] = useState<Pendaftar[]>([]);
    const [filteredData, setFilteredData] = useState<Pendaftar[]>([]);
    const [search, setSearch] = useState("");
    const [filterRute, setFilterRute] = useState("");
    const [expandedFamilies, setExpandedFamilies] = useState<Record<number, boolean>>({});
    
    // State UI Aksi Cepat (Dropdown Custom)
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    // Modal & Plotting State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Pendaftar | null>(null);
    const [showBusModal, setShowBusModal] = useState(false);
    const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
    const [selectedBusId, setSelectedBusId] = useState<string>("");
    const [buses, setBuses] = useState<any[]>([]);

    useEffect(() => {
        loadData();
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Filter Logic
    useEffect(() => {
        let res = data;
        if(search) {
            const lower = search.toLowerCase();
            res = res.filter(d => 
                d.nama_peserta.toLowerCase().includes(lower) || 
                d.nik_peserta.includes(lower) ||
                (d.nama_kepala_keluarga && d.nama_kepala_keluarga.toLowerCase().includes(lower))
            );
        }
        if(filterRute) res = res.filter(d => d.rute_tujuan === filterRute);
        setFilteredData(res);
    }, [search, filterRute, data]);

    const loadData = async () => {
        try {
            const res = await AdminAPI.getPendaftar();
            if(Array.isArray(res)) setData(res);
        } catch(e) { console.error("Gagal load data", e); }
    };

    // --- FITUR WA OTOMATIS ---
    const openWa = (noHp: string, status: string, param3: string) => { 
        if (!noHp || noHp.length < 5) return;
        
        let hp = noHp.replace(/\D/g, "");
        if (hp.startsWith("0")) hp = "62" + hp.substring(1);

        const dashboardLink = `${window.location.origin}/dashboard`;
        const konfirmasiLink = `${window.location.origin}/konfirmasi/${param3}`; 

        let text = "";

        if (status === 'DITERIMA') {
            text = `Selamat Bapak/Ibu *${param3}*!%0A%0A` 
                 + `Pendaftaran Mudik Gratis Anda telah *DITERIMA*.%0A`
                 + `Silakan cek status di aplikasi: ${dashboardLink}%0A`
                 + `Tunggu info selanjutnya untuk Konfirmasi Kehadiran (H-3).`;
        } else if (status === 'DITOLAK') {
            text = `Mohon Maaf Bapak/Ibu *${param3}*.%0A%0A` 
                 + `Pendaftaran Mudik Gratis Anda *DITOLAK* dikarenakan data tidak valid atau kuota penuh.`;
        } else if (status === 'WA_VERIF') {
            text = `Halo Bapak/Ibu *${param3}*.%0A%0A` 
                 + `Data pendaftaran Mudik Gratis Anda sedang kami *VERIFIKASI*.%0A`
                 + `Mohon tunggu informasi selanjutnya.`;
        } else if (status === 'WA_H3') {
            text = `Halo Bapak/Ibu.%0A%0A`
                 + `Mengingat jadwal keberangkatan *H-3*, mohon segera lakukan *KONFIRMASI KEHADIRAN* rombongan Anda.%0A%0A`
                 + `Klik link berikut untuk konfirmasi (Wajib):%0A`
                 + `${konfirmasiLink}%0A%0A`
                 + `Peserta yang tidak dikonfirmasi akan dianggap batal dan kursi dialihkan.`;
        } else if (status === 'WA_TIKET') {
            text = `Halo Bapak/Ibu *${param3}*.%0A%0A`
                 + `Bus Anda sudah ditentukan! Silakan unduh *E-Tiket* Mudik Gratis di aplikasi sekarang:%0A`
                 + `${dashboardLink}`;
        }

        window.open(`https://wa.me/${hp}?text=${text}`, "_blank");
    };

    // --- HANDLER AKSI MENU ---
    const handleMenuAction = async (action: string, familyId: number, head: Pendaftar) => {
        // Aksi 1: Plotting Bus (Buka Modal)
        if (action === "PLOTTING") {
            openPlotting(familyId);
            return;
        }
        
        // Aksi 2: Kirim WA Saja
        if (["WA_VERIF", "WA_H3", "WA_TIKET"].includes(action)) {
            const param = action === "WA_H3" ? head.id_keluarga.toString() : (head.nama_kepala_keluarga || head.nama_peserta);
            openWa(head.no_hp_target, action, param);
            return;
        }

        // Aksi 3: Ubah Status (Butuh API)
        let statusKirim = action; 
        if (action === "RESET") statusKirim = "MENUNGGU_VERIFIKASI"; // Reset balik ke awal

        const confirmMsg = action === "RESET" 
            ? `PULIHKAN data keluarga ini kembali ke status Menunggu Verifikasi?` 
            : `Yakin ubah status menjadi ${statusKirim}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const token = localStorage.getItem("token");
            await fetch(`${API.ADMIN_VERIF_KELUARGA}/${familyId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: statusKirim })
            });
            
            await loadData(); 

            // Auto WA jika Terima/Tolak
            if (statusKirim === 'DITERIMA' || statusKirim === 'DITOLAK') {
                openWa(head.no_hp_target, statusKirim, head.nama_kepala_keluarga || head.nama_peserta);
            }

        } catch (err) { alert("Gagal update status."); }
    };

    // --- LOGIC BUS ---
    const openPlotting = async (famId: number) => {
        setSelectedFamilyId(famId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API.ADMIN_KENDARAAN, { headers: { Authorization: `Bearer ${token}` }});
            const json = await res.json();
            setBuses(Array.isArray(json) ? json : []);
            setShowBusModal(true);
        } catch (e) { alert("Gagal load bus"); }
    };

    const submitPlotting = async () => {
        if(!selectedBusId) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${API.ADMIN_ASSIGN_BUS}?user_id=${selectedFamilyId}&kendaraan_id=${selectedBusId}`, {
            method: "POST", headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
            setShowBusModal(false);
            loadData();
            alert("✅ Plotting Berhasil!");
        } else {
            const msg = await res.json();
            alert("❌ Gagal: " + (msg.error || "Terjadi kesalahan"));
        }
    };

    // --- ACTIONS INDIVIDUAL ---
    const updateStatusIndividual = async (id: number, status: string) => {
        if (!window.confirm("Ubah status peserta ini?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API.ADMIN_VERIF}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            setIsModalOpen(false);
            loadData();
        } catch (err) { alert("Gagal."); }
    };

    // --- DOWNLOAD TIKET ---
    const downloadTiket = async (id: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API.TIKET}/download/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error("Gagal");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Tiket.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) { alert("Tiket belum tersedia."); }
    };

    const groupedList = groupData(filteredData);
    const uniqueRutes = useMemo(() => [...new Set(data.map(i => i.rute_tujuan))], [data]);

    // Helper Badge
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            'DITERIMA': 'bg-blue-100 text-blue-700 border-blue-200',
            'TERKONFIRMASI': 'bg-green-100 text-green-700 border-green-200',
            'DITOLAK': 'bg-red-100 text-red-700 border-red-200',
            'MENUNGGU_VERIFIKASI': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'DIBATALKAN': 'bg-slate-200 text-slate-500 border-slate-300'
        };
        const labels: any = {
            'DITERIMA': 'DITERIMA (H-3)',
            'TERKONFIRMASI': 'SIAP BERANGKAT'
        };
        return (
            <span className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wide ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status.replace(/_/g, " ")}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Verifikasi & Plotting</h1>
                    <p className="text-slate-500 text-sm">Kelola status pendaftar, konfirmasi H-3, dan pembagian bus.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/admin/kendaraan')} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200 hover:bg-purple-700 transition">
                        <Bus size={20}/> Kelola Bus
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate('/admin/login'); }} className="bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-bold hover:bg-red-50 transition flex items-center gap-2">
                        <LogOut size={20}/> Logout
                    </button>
                </div>
            </header>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 font-bold text-slate-500 text-sm whitespace-nowrap"><Filter size={16}/> FILTER DATA:</div>
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari Nama Peserta / NIK..." 
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                <select className="border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto bg-white" value={filterRute} onChange={e => setFilterRute(e.target.value)}>
                    <option value="">-- Semua Rute --</option>
                    {uniqueRutes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* TABEL DATA KELUARGA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 w-10">#</th>
                                <th className="px-6 py-4">Kepala Keluarga</th>
                                <th className="px-6 py-4">Tujuan & Jadwal</th>
                                <th className="px-6 py-4 text-center">Jml</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Plotting Bus</th>
                                <th className="px-6 py-4 text-right w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Object.keys(groupedList).length === 0 ? <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-medium">Data tidak ditemukan.</td></tr> :
                            Object.keys(groupedList).map((key) => {
                                const familyId = Number(key);
                                const members = groupedList[familyId];
                                const head = members[0];
                                const isExp = expandedFamilies[familyId];
                                const isDiterima = head.status === "DITERIMA";
                                const isTerkonfirmasi = head.status === "TERKONFIRMASI";
                                const isDibatalkan = head.status === "DIBATALKAN";
                                const isDropdownOpen = activeDropdown === familyId;

                                return (
                                    <React.Fragment key={familyId}>
                                        <tr className={`hover:bg-blue-50/50 transition ${isExp ? "bg-blue-50/30" : ""} ${isDibatalkan ? "opacity-60 bg-slate-50" : ""}`}>
                                            <td className="px-6 py-4">
                                                <button onClick={() => setExpandedFamilies(p => ({...p, [familyId]: !p[familyId]}))} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
                                                    {isExp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`font-bold text-base ${isDibatalkan ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{head.nama_kepala_keluarga || head.nama_peserta}</div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{head.no_hp_target}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-700">{head.rute_tujuan}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock size={10}/> {head.tgl_berangkat}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-xs"><Users size={12}/> {members.length}</span></td>
                                            <td className="px-6 py-4 text-center"><StatusBadge status={head.status} /></td>
                                            <td className="px-6 py-4 text-center">
                                                {isTerkonfirmasi ? (
                                                    head.nama_bus === "Belum Plotting" ? 
                                                    <span className="text-orange-500 text-xs font-bold flex items-center justify-center gap-1 animate-pulse"><AlertTriangle size={12}/> Wajib Plotting!</span> : 
                                                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 shadow-sm flex items-center justify-center gap-1">🚌 {head.nama_bus}</span>
                                                ) : isDiterima ? (
                                                    <span className="text-slate-400 text-xs italic">Menunggu Konfirmasi User</span>
                                                ) : "-"}
                                            </td>
                                            
                                            {/* 🔥 AKSI CEPAT (DROPDOWN MENU PREMIUM) 🔥 */}
                                            <td className="px-6 py-4 text-right relative">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(isDropdownOpen ? null : familyId); }}
                                                    className={`p-2 rounded-lg transition ${isDropdownOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>

                                                {isDropdownOpen && (
                                                    <div className="absolute right-8 top-12 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right text-left">
                                                        <div className="p-2 space-y-1">
                                                            
                                                            {/* 1. STATUS: DIBATALKAN (FITUR EMERGENCY RESET) */}
                                                            {isDibatalkan && (
                                                                <>
                                                                    <div className="px-3 py-2 text-xs text-slate-400 font-bold bg-slate-50 border-b mb-1">
                                                                        Data Dibatalkan
                                                                    </div>
                                                                    <MenuButton icon={<RefreshCw size={16}/>} label="Pulihkan (Reset)" onClick={() => handleMenuAction('RESET', familyId, head)} color="text-blue-600 hover:bg-blue-50" />
                                                                </>
                                                            )}

                                                            {/* 2. STATUS: MENUNGGU VERIFIKASI */}
                                                            {head.status === "MENUNGGU_VERIFIKASI" && (
                                                                <>
                                                                    <MenuButton icon={<CheckCircle size={16}/>} label="Terima Sekeluarga" onClick={() => handleMenuAction('DITERIMA', familyId, head)} color="text-green-600 hover:bg-green-50" />
                                                                    <MenuButton icon={<XCircle size={16}/>} label="Tolak Sekeluarga" onClick={() => handleMenuAction('DITOLAK', familyId, head)} color="text-red-600 hover:bg-red-50" />
                                                                    <MenuButton icon={<MessageCircle size={16}/>} label="WA: Sedang Verif" onClick={() => handleMenuAction('WA_VERIF', familyId, head)} />
                                                                </>
                                                            )}
                                                            
                                                            {/* 3. STATUS: DITERIMA (H-3) */}
                                                            {isDiterima && (
                                                                <>
                                                                    <MenuButton icon={<Send size={16}/>} label="Kirim Link Konfirmasi" onClick={() => handleMenuAction('WA_H3', familyId, head)} color="text-blue-600 hover:bg-blue-50" />
                                                                    <MenuButton icon={<Undo2 size={16}/>} label="Batalkan Penerimaan" onClick={() => handleMenuAction('RESET', familyId, head)} color="text-orange-600 hover:bg-orange-50" />
                                                                    <MenuButton icon={<XCircle size={16}/>} label="Tolak Permanen" onClick={() => handleMenuAction('DITOLAK', familyId, head)} color="text-red-600 hover:bg-red-50" />
                                                                </>
                                                            )}

                                                            {/* 4. STATUS: TERKONFIRMASI (SIAP PLOTTING) */}
                                                            {isTerkonfirmasi && (
                                                                <>
                                                                    <MenuButton icon={<Bus size={16}/>} label="Plotting Bus" onClick={() => handleMenuAction('PLOTTING', familyId, head)} color="text-purple-600 hover:bg-purple-50" />
                                                                    <MenuButton icon={<Printer size={16}/>} label="WA Info Tiket" onClick={() => handleMenuAction('WA_TIKET', familyId, head)} />
                                                                    <MenuButton icon={<RefreshCw size={16}/>} label="Reset ke Menunggu" onClick={() => handleMenuAction('RESET', familyId, head)} />
                                                                </>
                                                            )}

                                                            {!isDibatalkan && (
                                                                <>
                                                                    <div className="border-t border-slate-100 my-1"></div>
                                                                    <MenuButton icon={<Trash2 size={16}/>} label="Hapus Data (Batal)" onClick={() => handleMenuAction('DIBATALKAN', familyId, head)} color="text-slate-400 hover:text-red-600 hover:bg-red-50" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* DETAIL ANGGOTA KELUARGA */}
                                        {isExp && (
                                            <tr>
                                                <td colSpan={7} className="bg-slate-50 p-4 shadow-inner border-b">
                                                    <div className="ml-12 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                                        <div className="bg-slate-100/50 px-4 py-3 text-xs font-bold text-slate-500 flex justify-between items-center border-b border-slate-100">
                                                            <span>ANGGOTA KELUARGA (DETAIL)</span>
                                                            <span className="bg-white border px-2 py-0.5 rounded text-slate-600">{members.length} Orang</span>
                                                        </div>
                                                        <table className="w-full text-xs">
                                                            <tbody className="divide-y divide-slate-50">
                                                                {members.map(m => (
                                                                    <tr key={m.id} className="hover:bg-blue-50/30 transition">
                                                                        <td className="p-3 font-medium text-slate-700 w-1/4 flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px]">{m.nama_peserta.charAt(0)}</div>
                                                                            {m.nama_peserta}
                                                                        </td>
                                                                        <td className="p-3 text-slate-500 font-mono w-1/4">{m.nik_peserta}</td>
                                                                        <td className="p-3 text-slate-500 w-1/6">{m.kategori}</td>
                                                                        <td className="p-3 text-right">
                                                                            <div className="flex justify-end gap-3">
                                                                                <button 
                                                                                    onClick={() => { setSelectedItem(m); setIsModalOpen(true); }} 
                                                                                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 transition px-2 py-1 rounded hover:bg-blue-50"
                                                                                >
                                                                                    📄 Lihat Data
                                                                                </button>
                                                                                {m.status === 'TERKONFIRMASI' && (
                                                                                    <button onClick={() => downloadTiket(m.id)} className="text-green-600 hover:text-green-800 flex items-center gap-1.5 font-bold px-2 py-1 rounded hover:bg-green-50 transition">
                                                                                        <Printer size={14}/> Tiket
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETAIL */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
                        <div className="bg-slate-900 p-8 flex items-center justify-center md:w-1/2 relative group">
                            {selectedItem.foto_bukti ? 
                                <>
                                    <img src={`${BASE_URL}${selectedItem.foto_bukti}`} className="max-h-[300px] object-contain border-4 border-white/20 rounded-lg shadow-lg relative z-10"/>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20">
                                        <a href={`${BASE_URL}${selectedItem.foto_bukti}`} target="_blank" rel="noreferrer" className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition">Buka Full Size</a>
                                    </div>
                                </>
                                : 
                                <span className="text-white/50 flex flex-col items-center gap-2"><XCircle size={32}/> Tidak ada foto</span>
                            }
                        </div>
                        <div className="p-8 md:w-1/2 flex flex-col bg-white">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedItem.nama_peserta}</h3>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 inline-block font-mono">
                                        BOOKING: {selectedItem.kode_booking}
                                    </span>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition"><XCircle size={20}/></button>
                            </div>
                            
                            <div className="space-y-5 text-sm text-slate-600 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <DetailRow label="NIK" value={selectedItem.nik_peserta} mono />
                                <DetailRow label="Nomor HP" value={selectedItem.no_hp_target} />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailRow label="Jenis Kelamin" value={selectedItem.jenis_kelamin} />
                                    <DetailRow label="Kategori" value={selectedItem.kategori} />
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-start gap-3 mb-3">
                                        <MapPin className="text-red-500 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Rute Tujuan</p>
                                            <p className="font-bold text-slate-800">{selectedItem.rute_tujuan}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="text-blue-500 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Jadwal</p>
                                            <p className="font-medium text-slate-800">{selectedItem.tgl_berangkat}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                                    Tutup Detail
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PLOTTING BUS */}
            {showBusModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl transform transition-all scale-100">
                        <div className="flex items-center gap-3 mb-6 text-purple-700 bg-purple-50 p-4 rounded-xl">
                            <Bus size={28}/>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Pilih Armada</h3>
                                <p className="text-xs text-slate-500">Assign bus untuk keluarga ini.</p>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Daftar Bus Tersedia</label>
                            <select 
                                className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                                onChange={e => setSelectedBusId(e.target.value)}
                                value={selectedBusId}
                            >
                                <option value="">-- Pilih Bus --</option>
                                {buses.map((b:any) => {
                                    const sisa = b.kapasitas_total - b.terisi;
                                    const penuh = sisa <= 0;
                                    return (
                                        <option key={b.id} value={b.id} disabled={penuh} className={penuh ? "text-red-300" : "text-slate-700"}>
                                            {b.nama_armada} {penuh ? "(PENUH)" : `(Sisa: ${sisa})`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setShowBusModal(false)} className="flex-1 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm transition">Batal</button>
                            <button onClick={submitPlotting} disabled={!selectedBusId} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-200 transition disabled:opacity-50 disabled:cursor-not-allowed">Simpan Plotting</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SMALL COMPONENTS ---
const MenuButton = ({ icon, label, onClick, color = "text-slate-600 hover:bg-slate-50" }: any) => (
    <button onClick={onClick} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${color}`}>
        {icon} {label}
    </button>
);

const DetailRow = ({ label, value, mono = false }: any) => (
    <div>
        <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">{label}</p>
        <p className={`font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>{value || "-"}</p>
    </div>
);