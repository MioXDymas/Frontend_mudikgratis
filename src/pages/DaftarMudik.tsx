import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API } from "../lib/api"
import { 
  User, Users, MapPin, Bus, AlertCircle, 
  UploadCloud, Briefcase, ChevronDown, ChevronUp, CheckCircle, 
  Clock, Trash2, Plus, Minus, CalendarDays, FileText
} from "lucide-react"

/* ================= 1. TYPES ================= */
type RouteType = {
  rute_id: number
  tujuan: string
  kuota_tersisa: number
  tanggal_keberangkatan?: string 
  tanggalKeberangkatan?: string 
  nama_bus?: string
  namaBus?: string
}

type Passenger = {
  id_unik: number
  tipe: "DEWASA" | "ANAK-ANAK" | "BAYI"
  label: string
  bayi: boolean

  nama: string
  nik: string
  noHp: string
  jenisKelamin: string
  tanggalLahir: string 
  
  jenisIdentitas: string 
  jenisBarang: "Koper" | "Kardus" | "Tas Ransel" | "Lainnya"
  ukuranBarang: "Kecil" | "Sedang" | "Besar"
  alamatRumah: string 
  
  fotoBukti: File | null
  fotoPreview?: string
  isExpanded?: boolean
}

export default function DaftarMudik() {
  const navigate = useNavigate()
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  
  // STATE VALIDASI RIWAYAT
  const [hasExistingAdult, setHasExistingAdult] = useState(false)

  // --- HELPER ---
  const getRuteDate = (r: any) => r.tanggal_keberangkatan || r.tanggalKeberangkatan || r.tanggal || r.waktu_berangkat;
  const getRuteBus = (r: any) => r.nama_bus || r.namaBus || r.bus || "Bus Dishub";

  const formatDateTime = (dateRaw: any) => {
    if (!dateRaw) return "Jadwal Menyusul";
    try {
        let dateObj: Date;
        if (Array.isArray(dateRaw)) {
            const month = dateRaw[1] - 1; 
            dateObj = new Date(dateRaw[0], month, dateRaw[2], dateRaw[3]||0, dateRaw[4]||0);
        } else {
            dateObj = new Date(dateRaw);
        }
        if (isNaN(dateObj.getTime())) return "Format Error";
        const tgl = dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
        const jam = dateObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${tgl} • Jam ${jam} WIB`;
    } catch (e) { return "Jadwal Error"; }
  }

  // --- AUTH ---
  const getUserId = () => {
    const uid = localStorage.getItem("userId")
    return uid ? uid.replace(/"/g, "") : null
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return -1
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  useEffect(() => {
    if (!getUserId()) { alert("Anda belum login!"); navigate("/login"); }
  }, [navigate])

  // --- LOAD RUTE ---
  const [routes, setRoutes] = useState<RouteType[]>([])
  const [routeId, setRouteId] = useState("")

  useEffect(() => {
    fetch(API.RUTE) 
      .then((r) => r.json())
      .then((d) => setRoutes(Array.isArray(d) ? d : d.data || []))
      .catch((e) => console.error("Gagal load rute", e))
  }, [])

  // 🔥🔥🔥 FIX LOGIC DETECT RIWAYAT 🔥🔥🔥
  useEffect(() => {
    const checkHistory = async () => {
        const userId = getUserId()
        const token = localStorage.getItem("token") 
        if (!userId || !token) return

        try {
            // Pastikan URL API benar
            const url = API.RIWAYAT || "http://localhost:8080/api/pendaftaran/riwayat" 
            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}`, "userId": userId }
            })
            
            if (res.ok) {
                const data = await res.json()
                const list = Array.isArray(data) ? data : []
                
                console.log("DEBUG RIWAYAT:", list) // Cek F12 Console!

                // LOGIC DETEKSI YANG LEBIH PINTAR
                const adaDewasa = list.some((p: any) => {
                    const status = p.status_pendaftaran || p.status;
                    
                    // 1. Skip kalau DITOLAK / DIBATALKAN
                    if (status === 'DITOLAK' || status === 'DIBATALKAN') return false;

                    // 2. Cek Field Kategori (Kalau backend kirim)
                    const kat = p.kategori || p.kategori_penumpang || "";
                    if (kat === "DEWASA") return true;

                    // 3. Cek Tanggal Lahir (Kalau backend kirim)
                    if (p.tanggal_lahir) {
                        let tglStr = p.tanggal_lahir;
                        if (Array.isArray(tglStr)) {
                            tglStr = `${tglStr[0]}-${String(tglStr[1]).padStart(2, '0')}-${String(tglStr[2]).padStart(2, '0')}`;
                        }
                        if (calculateAge(tglStr) >= 17) return true;
                    }

                    // 4. 🔥 FALLBACK SAKTI: 
                    // Kalau Backend lupa kirim kategori/umur, TAPI user punya riwayat aktif, 
                    // kita anggap record pertama adalah Dewasa (Pemilik Akun).
                    // Asumsi: Anak gak mungkin daftar sendirian di awal.
                    if (!kat && !p.tanggal_lahir) {
                        console.warn("Backend tidak kirim kategori/umur. Menggunakan asumsi record aktif = Dewasa.");
                        return true; 
                    }

                    return false;
                });

                if (adaDewasa) {
                    setHasExistingAdult(true)
                    console.log("✅ User TERVERIFIKASI punya Dewasa.")
                }
            }
        } catch (e) { console.error("Error cek riwayat", e) }
    }
    checkHistory()
  }, [])


  // --- STATE PENUMPANG ---
  const [penumpang, setPenumpang] = useState<Passenger[]>([])

  const createPassenger = (tipe: "DEWASA" | "ANAK-ANAK" | "BAYI", indexUrut: number): Passenger => ({
    id_unik: Date.now() + Math.random(),
    tipe,
    label: tipe === "DEWASA" ? `Dewasa ${indexUrut}` : tipe === "ANAK-ANAK" ? `Anak ${indexUrut}` : `Bayi ${indexUrut}`,
    bayi: tipe === "BAYI",
    nama: "", nik: "", noHp: "", jenisKelamin: "", alamatRumah: "",
    tanggalLahir: "",
    jenisIdentitas: "KK", 
    jenisBarang: "Tas Ransel",
    ukuranBarang: "Kecil",
    fotoBukti: null,
    isExpanded: true 
  })

  // --- LOGIC AUTO FORM ---
  const countType = (t: string) => penumpang.filter(p => p.tipe === t).length

  const handleAddAuto = (tipe: "DEWASA" | "ANAK-ANAK" | "BAYI") => {
    if (penumpang.length >= 6) return alert("Maksimal 6 penumpang per akun!")
    
    // Logic validasi tambah
    if ((tipe === "ANAK-ANAK" || tipe === "BAYI")) {
        // Cek: Form kosong AND Database kosong
        if (countType("DEWASA") === 0 && !hasExistingAdult) {
            return alert("Harus ada penumpang DEWASA dulu (di form ini atau riwayat sebelumnya)!")
        }
    }

    const currentCount = countType(tipe)
    const newP = createPassenger(tipe, currentCount + 1)
    if (tipe === "DEWASA") newP.jenisIdentitas = "KTP"
    else newP.jenisIdentitas = "KIA"

    setPenumpang(curr => [...curr, newP])
  }

  const handleRemoveAuto = (tipe: "DEWASA" | "ANAK-ANAK" | "BAYI") => {
    const newArr = [...penumpang]
    let lastIndex = -1
    for (let i = newArr.length - 1; i >= 0; i--) {
        if (newArr[i].tipe === tipe) { lastIndex = i; break; }
    }
    if (lastIndex !== -1) {
        if (tipe === "DEWASA" && countType("DEWASA") === 1 && (countType("ANAK-ANAK") > 0 || countType("BAYI") > 0)) {
            if (!hasExistingAdult) return alert("Hapus Anak/Bayi dulu sebelum menghapus Dewasa terakhir!")
        }
        newArr.splice(lastIndex, 1)
        setPenumpang(newArr)
    }
  }

  const removeSpecific = (index: number) => {
    const p = penumpang[index]
    if (p.tipe === "DEWASA" && countType("DEWASA") === 1 && penumpang.length > 1 && !hasExistingAdult) {
        return alert("Tidak bisa menghapus Dewasa terakhir. Anak/Bayi butuh pendamping.")
    }
    if(!confirm("Hapus penumpang ini?")) return
    setPenumpang(prev => prev.filter((_, i) => i !== index))
  }

  const update = (i: number, k: keyof Passenger, v: any) => {
    setPenumpang((p) =>
      p.map((x, idx) => idx === i ? { ...x, [k]: v, ...(k === "fotoBukti" && v ? { fotoPreview: URL.createObjectURL(v) } : {}) } : x)
    )
  }
  
  const isiDataPemilik = (index: number) => {
      const nama = localStorage.getItem("nama")?.replace(/"/g, "") || ""
      if(nama) update(index, "nama", nama)
  }

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSubmit(true)
    const userId = getUserId()
    const token = localStorage.getItem("token")
    
    if (countType("DEWASA") === 0 && !hasExistingAdult) {
        setLoadingSubmit(false)
        return alert("❌ Pendaftaran Gagal!\nWajib ada minimal 1 Penumpang Dewasa (Penanggung Jawab).")
    }

    try {
        const fd = new FormData()
        for (const p of penumpang) {
            if (!p.nama || !p.nik || !p.jenisKelamin || !p.tanggalLahir || !p.fotoBukti || !p.alamatRumah) {
                throw new Error(`Data ${p.label} belum lengkap!`)
            }
            if (p.nik.length !== 16) throw new Error(`NIK ${p.label} harus 16 digit!`)

            const age = calculateAge(p.tanggalLahir)
            if (p.tipe === "DEWASA" && age < 17) throw new Error(`${p.label}: Umur ${age} thn (Dewasa harus 17+)`)
            if (p.tipe === "ANAK-ANAK" && (age < 5 || age >= 17)) throw new Error(`${p.label}: Umur ${age} thn (Anak harus 5-16 thn)`)
            if (p.tipe === "BAYI" && age >= 5) throw new Error(`${p.label}: Umur ${age} thn (Bayi harus < 5 thn)`)

            fd.append("nama_peserta", p.nama)
            fd.append("nik_peserta", p.nik)
            fd.append("jenis_kelamin", p.jenisKelamin)
            fd.append("tanggal_lahir", p.tanggalLahir)
            fd.append("jenis_identitas", p.jenisIdentitas)
            fd.append("jenis_barang", p.jenisBarang)
            fd.append("ukuran_barang", p.ukuranBarang)
            fd.append("alamat_rumah", p.alamatRumah)
            fd.append("no_hp_peserta", p.noHp || "-")
            fd.append("foto_bukti", p.fotoBukti)
        }

        const res = await fetch(`${API.PENDAFTARAN}?rute_id=${routeId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "userId": userId || "" },
            body: fd
        })

        const text = await res.text()
        let json
        try { json = JSON.parse(text) } catch { throw new Error("Server Error") }

        if (!res.ok) throw new Error(json.error || "Gagal mendaftar")

        alert(`✅ BERHASIL! ${json.pesan}`)
        navigate("/dashboard")

    } catch (err: any) { alert("❌ " + err.message) } 
    finally { setLoadingSubmit(false) }
  }

  const selectedRoute = routes.find(r => r.rute_id.toString() === routeId)

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center pb-24 font-sans text-slate-800">
      <div className="w-full max-w-4xl">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-3xl shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3"><Bus className="text-yellow-400"/> Pendaftaran Mudik</h1>
          <p className="mt-2 text-sm text-blue-100">Isi data sesuai KTP/KK. Max 6 Penumpang.</p>
        </div>

        <div className="bg-white rounded-b-3xl shadow-xl p-6 space-y-8">
          {/* STEP 1: PILIH RUTE */}
          <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <label className="block mb-3 font-bold text-slate-700 flex items-center gap-2"><MapPin size={18} className="text-red-500"/> Pilih Tujuan & Jadwal</label>
            <div className="relative">
                <select className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
                  <option value="">-- Pilih Kota Tujuan --</option>
                  {routes.map((r) => (
                      <option key={r.rute_id} value={r.rute_id} disabled={r.kuota_tersisa <= 0}>
                          {r.tujuan} — {formatDateTime(getRuteDate(r))} {r.kuota_tersisa <= 0 ? "(PENUH)" : `(Sisa: ${r.kuota_tersisa})`}
                      </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20}/>
            </div>
            {selectedRoute && (
                <div className="mt-4 flex flex-col md:flex-row gap-3 text-blue-800 text-sm bg-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2"><Bus size={18}/> <span>Bus: <b>{getRuteBus(selectedRoute)}</b></span></div>
                    <div className="flex items-center gap-2"><Clock size={18}/> <span>Berangkat: <b>{formatDateTime(getRuteDate(selectedRoute))}</b></span></div>
                </div>
            )}
          </section>

          {/* STEP 2: CONTROLLER */}
          <section>
            <label className="block font-bold text-slate-700 mb-4 flex items-center gap-2"><Users size={18} className="text-blue-600"/> Tambah Penumpang</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <ControlCard label="Dewasa (17+)" count={countType("DEWASA")} onAdd={() => handleAddAuto("DEWASA")} onRemove={() => handleRemoveAuto("DEWASA")} />
               <ControlCard label="Anak (5-16)" count={countType("ANAK-ANAK")} onAdd={() => handleAddAuto("ANAK-ANAK")} onRemove={() => handleRemoveAuto("ANAK-ANAK")} disabled={!hasExistingAdult && countType("DEWASA") === 0} />
               <ControlCard label="Bayi (<5)" count={countType("BAYI")} onAdd={() => handleAddAuto("BAYI")} onRemove={() => handleRemoveAuto("BAYI")} disabled={!hasExistingAdult && countType("DEWASA") === 0} />
            </div>
            {!hasExistingAdult && countType("DEWASA") === 0 && <p className="text-xs text-red-500 mt-2 italic font-bold animate-pulse">* Anda belum memiliki riwayat penumpang Dewasa. Tambahkan Dewasa terlebih dahulu.</p>}
            {hasExistingAdult && <p className="text-xs text-green-600 mt-2 italic font-bold flex items-center gap-1"><CheckCircle size={14}/> Akun Anda sudah terverifikasi memiliki penumpang Dewasa.</p>}
          </section>

          {/* STEP 3: FORM */}
          {penumpang.length > 0 && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 text-sm">
                <AlertCircle size={18}/> <span>Total: <b>{penumpang.length} Penumpang</b>. Pastikan data KTP/KK sesuai.</span>
              </div>
              {penumpang.map((p, i) => (
                <div key={p.id_unik} className={`border rounded-2xl bg-white overflow-hidden transition-all duration-300 ${p.isExpanded ? "ring-2 ring-blue-100 border-blue-300 shadow-md" : "border-slate-200"}`}>
                  <div onClick={() => setPenumpang(curr => curr.map((x, idx) => idx === i ? { ...x, isExpanded: !x.isExpanded } : x))} className={`p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 ${p.isExpanded ? "bg-blue-50/30" : ""}`}>
                    <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.nama ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>{p.nama ? <CheckCircle size={16}/> : (i + 1)}</span>
                        <div><p className="font-bold text-slate-800">{p.label}</p><p className="text-xs text-slate-500">{p.nama || "Klik untuk isi data..."}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeSpecific(i); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"><Trash2 size={18} /></button>
                        {p.isExpanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                    </div>
                  </div>
                  {p.isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                      {p.tipe === "DEWASA" && !p.nama && (<div className="mb-4 flex justify-end"><button type="button" onClick={() => isiDataPemilik(i)} className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:underline"><User size={12}/> Isi dengan Data Akun Saya</button></div>)}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><Label>Nama Lengkap</Label><Input value={p.nama} onChange={(e: any) => update(i, "nama", e.target.value)} placeholder="Sesuai KTP/KK" /></div>
                        <div><Label>NIK</Label><Input type="number" value={p.nik} onChange={(e: any) => update(i, "nik", e.target.value)} placeholder="16 Digit" /></div>
                        <div>
                          <Label>Tanggal Lahir</Label>
                          <div className="relative">
                            <input type="date" className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer text-slate-700" value={p.tanggalLahir} max={new Date().toISOString().split("T")[0]} onChange={(e) => update(i, "tanggalLahir", e.target.value)}/>
                            <CalendarDays size={18} className="absolute left-3 top-3.5 text-blue-500 pointer-events-none"/>
                          </div>
                          {p.tanggalLahir && <p className="text-xs mt-1 font-bold">Umur: {calculateAge(p.tanggalLahir)} Thn</p>}
                        </div>
                        <div><Label>Jenis Kelamin</Label><Select value={p.jenisKelamin} onChange={(e: any) => update(i, "jenisKelamin", e.target.value)}><option value="">-- Pilih --</option><option value="LAKI-LAKI">Laki-laki</option><option value="PEREMPUAN">Perempuan</option></Select></div>
                        <div><Label>Identitas</Label><div className="relative"><select className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition" value={p.jenisIdentitas} onChange={(e: any) => update(i, "jenisIdentitas", e.target.value)}>{p.tipe === "DEWASA" ? <><option value="KTP">KTP</option><option value="KK">KK</option></> : <><option value="KIA">KIA</option><option value="KK">KK</option><option value="AKTA">Akta</option></>}</select><FileText size={18} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"/><ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/></div></div>
                        <div><Label>No. HP</Label><Input type="tel" value={p.noHp} onChange={(e: any) => update(i, "noHp", e.target.value)} placeholder="Opsional" /></div>
                        <div className="md:col-span-2"><Label>Alamat</Label><Input value={p.alamatRumah} onChange={(e: any) => update(i, "alamatRumah", e.target.value)} placeholder="Contoh: Jl. Mawar No. 1..." /></div>
                        <div className="md:col-span-2 border-t pt-4">
                            <p className="text-sm font-bold text-slate-700 mb-2 flex gap-2"><Briefcase size={16}/> Barang & Foto</p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Select value={p.jenisBarang} onChange={(e: any) => update(i, "jenisBarang", e.target.value)}><option value="Tas Ransel">Tas Ransel</option><option value="Koper">Koper</option><option value="Kardus">Kardus</option><option value="Lainnya">Lainnya</option></Select>
                                <Select value={p.ukuranBarang} onChange={(e: any) => update(i, "ukuranBarang", e.target.value)}><option value="Kecil">Kecil</option><option value="Sedang">Sedang</option><option value="Besar">Besar</option></Select>
                            </div>
                            <div className={`border-2 border-dashed rounded-xl p-4 text-center relative transition ${p.fotoBukti ? "bg-green-50 border-green-400" : "hover:bg-slate-50 border-slate-300"}`}>
                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => update(i, "fotoBukti", e.target.files?.[0])} />
                                {p.fotoPreview ? <div className="flex items-center justify-center gap-3"><img src={p.fotoPreview} className="h-16 object-contain rounded border bg-white" alt="preview"/><div className="text-left"><p className="text-xs font-bold text-green-700">Foto Terupload ✅</p></div></div> : <div className="py-2"><UploadCloud size={24} className="mx-auto text-blue-400 mb-2"/><p className="text-xs font-bold text-slate-600">Upload Foto</p></div>}
                            </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-4 pt-4 border-t border-slate-200">
                 <button type="button" onClick={() => {if(confirm("Reset semua?")) setPenumpang([])}} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition">Reset</button>
                 <button type="submit" disabled={loadingSubmit} className="flex-[2] py-4 bg-blue-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition disabled:opacity-70 flex items-center justify-center gap-2">{loadingSubmit ? "Mengirim..." : <><Bus size={20}/> Kirim</>}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

const ControlCard = ({label, count, onAdd, onRemove, disabled}: any) => (<div className={`flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition ${disabled ? 'opacity-50 pointer-events-none' : ''}`}><span className="font-bold text-sm mb-2 text-slate-600">{label}</span><div className="flex items-center gap-4"><button onClick={onRemove} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center transition disabled:opacity-50"><Minus size={18}/></button><span className="text-2xl font-bold w-6 text-center text-slate-800">{count}</span><button onClick={onAdd} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-blue-700 transition"><Plus size={18}/></button></div></div>)
const Label = ({children}: any) => <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{children}</label>
const Input = (props: any) => <input {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder:text-slate-400"/>
const Select = (props: any) => <div className="relative"><select {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition text-slate-800">{props.children}</select><ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/></div>