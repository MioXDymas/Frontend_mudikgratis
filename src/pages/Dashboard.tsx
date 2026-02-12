import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { API } from "../lib/api"
import {
  Download,
  Bus,
  Calendar,
  ChevronDown,
  LogOut,
  Info,
  HelpCircle,
  User,
  MapPin,
  Clock,
  AlertCircle,
  Ticket,
  Loader2
} from "lucide-react"

// HERO IMAGES
import hero1 from "../assets/dashboard image header1.jpeg"
import hero2 from "../assets/dashboard image header2.jpeg"
import hero3 from "../assets/dashboard image header3.jpeg"
import hero4 from "../assets/dashboard image header4.jpeg"

// =====================
// TYPE DATA
// =====================
type Pendaftaran = {
  pendaftaran_id: number
  kode_booking: string
  status_pendaftaran: string
  nama_peserta: string
  nik_peserta: string
  tujuan: string
  tanggal_keberangkatan: string
  nama_bus: string | null // Bisa null dari backend
  plat_nomor: string | null
}

export default function Dashboard() {
  const navigate = useNavigate()

  // ================= STATE =================
  const [loading, setLoading] = useState(true)
  const [listData, setListData] = useState<Pendaftaran[]>([])
  const [openMenu, setOpenMenu] = useState(false)

  // HERO SLIDER
  const heroImages = [hero1, hero2, hero3, hero4]
  const [heroIndex, setHeroIndex] = useState(0)
  const [fade, setFade] = useState(true)

  const namaAkun = localStorage.getItem("nama") || "User"
  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")

  // ================= HERO SLIDE =================
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % heroImages.length)
        setFade(true)
      }, 700)
    }, 6000)

    return () => clearInterval(interval)
  }, [heroImages.length])

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!token || !userId) {
      setLoading(false)
      return
    }

    const url = API.RIWAYAT || "http://localhost:8080/api/pendaftaran/riwayat"

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        userId: userId,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (Array.isArray(res)) {
            setListData(res)
        } else {
            console.error("Format data salah:", res)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [token, userId])

  // ================= KUOTA =================
  const maxKuota = 6
  const terpakai = listData.length
  const sisa = maxKuota - terpakai
  const bolehNambah = sisa > 0

  // ================= DOWNLOAD =================
  const handleDownload = async (id: number, nama: string) => {
    try {
      // Kita fetch BLOB (Binary Large Object) PDF
      const res = await fetch(`${API.TIKET}/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!res.ok) {
          // Kalau backend nolak (misal belum plotting), baca error text-nya
          const errorText = await res.text();
          throw new Error(errorText || "Gagal download");
      }
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Tiket_Mudik_${nama.replace(/\s+/g, "_")}.pdf`
      a.click()
      window.URL.revokeObjectURL(url) // Bersihkan memory
    } catch (err: any) {
      // Tampilkan pesan error dari backend (misal: "Admin belum plotting")
      let msg = err.message;
      if(msg.includes("{")) { // Kalau errornya JSON object
          try { msg = JSON.parse(msg).error } catch {}
      }
      alert("⚠️ Gagal: " + msg)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600"/>
            <span>Memuat data mudik...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans">

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[240px] sm:h-[280px] overflow-hidden rounded-b-[40px] shadow-lg">
        <img
          src={heroImages[heroIndex]}
          className={`absolute inset-0 w-full h-full object-cover
          transition-all duration-[1800ms]
          ${fade ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
          alt="Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/40" />

        {/* USER MENU */}
        <div className="absolute top-6 right-6 z-30">
          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2 rounded-full transition border border-white/20 backdrop-blur-sm"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs opacity-80">Halo,</p>
                <p className="font-bold text-sm leading-tight">{namaAkun}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow-md border-2 border-white">
                {namaAkun.charAt(0).toUpperCase()}
              </div>
              <ChevronDown
                size={16}
                className={`transition duration-300 ${openMenu ? "rotate-180" : ""}`}
              />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-40 animate-fade-in-down origin-top-right">
                <MenuItem
                  icon={<Info size={18} />}
                  label="Tentang Program"
                  onClick={() => { navigate("/program"); setOpenMenu(false); }}
                />
                <MenuItem
                  icon={<HelpCircle size={18} />}
                  label="Pusat Bantuan"
                  onClick={() => { navigate("/bantuan"); setOpenMenu(false); }}
                />
                <div className="h-px bg-slate-100 my-1"></div>
                <MenuItem
                  icon={<LogOut size={18} />}
                  label="Keluar Aplikasi"
                  danger
                  onClick={() => {
                    localStorage.clear()
                    navigate("/login")
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-center text-white">
          <span className="bg-blue-500/30 w-fit px-3 py-1 rounded-full text-xs font-bold mb-2 border border-blue-400/50 backdrop-blur-sm">
             Mudik Gratis 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md">
            Seulamat Jalan, <br/>Sampai Tujuan.
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-lg leading-relaxed drop-shadow-sm">
            Pantau status pendaftaran dan tiket perjalanan mudik Anda di sini.
          </p>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="max-w-5xl mx-auto px-6 -mt-12 relative z-20 space-y-8">

        {/* INFO KUOTA CARD */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-blue-50 rounded-full text-blue-600 shadow-inner">
            <User size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-bold text-slate-800">Kuota Akun Keluarga</h2>
            <p className="text-sm text-slate-500">
              Anda dapat mendaftarkan maksimal 6 anggota keluarga dalam satu akun.
            </p>
            
            <div className="mt-3 flex items-center justify-center md:justify-start gap-4 text-sm font-medium">
                <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">Terpakai: <strong className="text-slate-900">{terpakai}</strong></span>
                <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">Sisa: <strong className={sisa > 0 ? "text-green-600" : "text-red-500"}>{sisa}</strong></span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            {bolehNambah ? (
              <button
                onClick={() => navigate("/daftar-mudik")}
                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Bus size={18}/> Tambah Penumpang
              </button>
            ) : (
              <div className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold border border-red-100 flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
                <AlertCircle size={18}/> Kuota Penuh
              </div>
            )}
          </div>
        </div>

        {/* LIST PENUMPANG */}
        <div>
          <h3 className="font-bold text-slate-800 mb-6 text-xl flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            Daftar & Status Tiket
          </h3>

          {listData.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bus size={32} className="text-slate-400"/>
                </div>
                <p className="text-slate-600 font-bold">Belum ada data pendaftaran.</p>
                <p className="text-slate-400 text-sm mt-1 mb-4">Silakan daftarkan diri atau keluarga Anda sekarang.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {listData.map((p) => (
                <CardPenumpang
                    key={p.pendaftaran_id}
                    data={p}
                    onDownload={() => handleDownload(p.pendaftaran_id, p.nama_peserta)}
                />
                ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

// ================= COMPONENT KECIL =================

function MenuItem({ icon, label, onClick, danger = false }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition
      ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
    >
      {icon}
      {label}
    </button>
  )
}

function CardPenumpang({ data, onDownload }: { data: Pendaftaran; onDownload: () => void }) {
  
  // Logic Status
  const isTerkonfirmasi = data.status_pendaftaran === 'TERKONFIRMASI';
  const isDiterima = data.status_pendaftaran === 'DITERIMA';
  const isMenunggu = data.status_pendaftaran === 'MENUNGGU_VERIFIKASI';
  const isDitolak = data.status_pendaftaran === 'DITOLAK' || data.status_pendaftaran === 'DIBATALKAN';

  // 🔥 VALIDASI KETAT BUS (BIAR GAK BISA DOWNLOAD KALAU BELUM PLOTTING) 🔥
  // 1. Bus tidak boleh null
  // 2. Bus tidak boleh string kosong
  // 3. Bus tidak boleh "-"
  // 4. Bus tidak boleh "Belum Plotting" (Default value dari backend)
  const busValid = data.nama_bus && 
                   data.nama_bus.trim() !== "" && 
                   data.nama_bus !== "-" && 
                   data.nama_bus.toLowerCase() !== "belum plotting";

  // Syarat Download: SUDAH KONFIRMASI WA + SUDAH ADA BUS
  const canDownload = isTerkonfirmasi && busValid;

  // Helper Badge Status
  const StatusBadge = () => {
      let color = "bg-slate-100 text-slate-600 border-slate-200";
      let label = data.status_pendaftaran.replace(/_/g, " ");

      if (isTerkonfirmasi) {
          color = "bg-green-100 text-green-700 border-green-200";
          label = "SIAP BERANGKAT";
      } else if (isDiterima) {
          color = "bg-blue-100 text-blue-700 border-blue-200";
          label = "DITERIMA";
      } else if (isMenunggu) {
          color = "bg-yellow-100 text-yellow-700 border-yellow-200";
      } else if (isDitolak) {
          color = "bg-red-100 text-red-700 border-red-200";
      }

      return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${color}`}>
            {label}
        </span>
      );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
      {/* Dekorasi Background */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20 transition
        ${canDownload ? "bg-green-500" : isTerkonfirmasi ? "bg-purple-500" : isDiterima ? "bg-blue-500" : "bg-slate-300"}
      `}></div>

      <div className="relative z-10 flex-1">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h4 className="font-bold text-lg text-slate-800 line-clamp-1">{data.nama_peserta}</h4>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${canDownload ? "bg-green-500" : "bg-slate-300"}`}></span>
                    NIK: {data.nik_peserta}
                </p>
            </div>
            <StatusBadge />
        </div>

        <div className="space-y-3 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-5">
            <div className="flex gap-3 items-start">
                <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tujuan</p>
                    <p className="font-semibold text-slate-700">{data.tujuan || "-"}</p>
                </div>
            </div>
            
            <div className="flex gap-3 items-start">
                <Calendar size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jadwal</p>
                    <p className="font-semibold text-slate-700">{data.tanggal_keberangkatan || "Menunggu Jadwal"}</p>
                </div>
            </div>

            <div className="flex gap-3 items-start">
                <Bus size={16} className="text-purple-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bus</p>
                    {busValid ? (
                        <>
                            <p className="font-semibold text-purple-700">{data.nama_bus}</p>
                            {data.plat_nomor && data.plat_nomor !== "-" && (
                                <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500 font-mono mt-1 inline-block">
                                    {data.plat_nomor}
                                </span>
                            )}
                        </>
                    ) : (
                        <p className="font-medium text-slate-400 italic text-xs">Sedang diatur Admin...</p>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER ACTION AREA */}
      <div className="mt-auto pt-4 border-t border-slate-50">
        
        {/* CASE 1: SIAP DOWNLOAD (Status OK + Bus OK) */}
        {canDownload && (
            <button
            onClick={onDownload}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition animate-in fade-in"
            >
            <Download size={18} /> Download E-Tiket
            </button>
        )}

        {/* CASE 2: TERKONFIRMASI TAPI BELUM ADA BUS (Menunggu Plotting) */}
        {isTerkonfirmasi && !busValid && (
             <div className="bg-purple-50 text-purple-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-purple-100">
                <Ticket size={16} className="shrink-0" />
                <span>
                    <strong>Terkonfirmasi!</strong> Tiket akan tersedia setelah Admin menentukan nomor bus. Mohon cek berkala.
                </span>
            </div>
        )}

        {/* CASE 3: DITERIMA (Menunggu H-3) */}
        {isDiterima && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-xs flex items-start gap-2 border border-blue-100">
                <Clock size={16} className="shrink-0 mt-0.5"/>
                <span>
                    <strong>Data Valid!</strong> Mohon tunggu pesan WhatsApp H-3 keberangkatan untuk <u>Konfirmasi Kehadiran</u>.
                </span>
            </div>
        )}

        {/* CASE 4: MENUNGGU VERIFIKASI */}
        {isMenunggu && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-yellow-100 justify-center">
                <Info size={16} />
                <span>Data sedang diperiksa/diverifikasi oleh Admin.</span>
            </div>
        )}

        {/* CASE 5: DITOLAK */}
        {isDitolak && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-100 justify-center">
                <AlertCircle size={16} />
                <span>Mohon maaf, pendaftaran tidak lolos/dibatalkan.</span>
            </div>
        )}

      </div>
    </div>
  )
}