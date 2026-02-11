import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API } from "../lib/api"
import { 
  User, Users, MapPin, Bus, AlertCircle, 
  UploadCloud, Briefcase, ChevronDown, ChevronUp, CheckCircle, 
  Clock, Trash2, Plus, Minus
} from "lucide-react"

/* ================= 1. TYPES YANG LEBIH KUAT ================= */
type RouteType = {
  rute_id: number
  tujuan: string
  kuota_tersisa: number
  
  // Backend kadang kirim snake_case, kadang camelCase. Kita siapin dua-duanya.
  tanggal_keberangkatan?: string 
  tanggalKeberangkatan?: string 
  
  nama_bus?: string
  namaBus?: string
}

type Passenger = {
  id_unik: number // Helper biar React gak bingung render list
  tipe: "DEWASA" | "ANAK-ANAK" | "BAYI"
  label: string
  bayi: boolean

  nama: string
  nik: string
  noHp: string
  jenisKelamin: string
  tanggalLahir: string 
  
  jenisIdentitas: "KTP" | "KK" | "KIA"
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

  // --- 2. HELPER: AMBIL DATA RUTE (ANTI ZONK) ---
  //const getRuteDate = (r: RouteType) => r.tanggal_keberangkatan || r.tanggalKeberangkatan
  //const getRuteBus = (r: RouteType) => r.nama_bus || r.namaBus || "Bus Dishub"

// --- HELPER: AMBIL DATA RUTE (SUPER LENGKAP) ---
  const getRuteDate = (r: any) => {
      // Kita cek semua kemungkinan nama field yang mungkin dikirim backend
      const tgl = r.tanggal_keberangkatan || 
                  r.tanggalKeberangkatan || 
                  r.tanggal || 
                  r.waktu_berangkat;
      
      // DEBUG: Biar ketahuan di console browser isinya apa
      if (!tgl) console.warn("Rute ID " + r.rute_id + " gak punya tanggal!", r);
      return tgl;
  }

  const getRuteBus = (r: any) => {
      return r.nama_bus || r.namaBus || r.bus || "Bus Dishub";
  }

  // --- HELPER: FORMAT TANGGAL (SUPPORT ARRAY JAVA) ---
  const formatDateTime = (dateRaw: any) => {
    if (!dateRaw) return "Jadwal Menyusul";
    
    try {
        let dateObj: Date;

        // KASUS 1: Backend kirim Array Java [2026, 4, 15, 8, 0]
        if (Array.isArray(dateRaw)) {
            // Java LocalDateTime array: [Year, Month, Day, Hour, Minute, ...]
            // Ingat: Di JS bulan mulai dari 0 (Januari = 0), tapi biasanya Java kirim 1 (Januari = 1)
            // Jadi kita harus kurangi bulan dengan 1
            const year = dateRaw[0];
            const month = dateRaw[1] - 1; 
            const day = dateRaw[2];
            const hour = dateRaw[3] || 0;
            const minute = dateRaw[4] || 0;
            dateObj = new Date(year, month, day, hour, minute);
        } 
        // KASUS 2: Backend kirim String ISO "2026-04-15T08:00:00"
        else {
            dateObj = new Date(dateRaw);
        }

        if (isNaN(dateObj.getTime())) return "Format Error";
        
        const tgl = dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
        const jam = dateObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return `${tgl} • Jam ${jam} WIB`;
    } catch (e) {
        console.error("Error format tanggal:", e);
        return "Jadwal Error";
    }
  }
  // --- 4. AUTH & UTILS ---
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
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
  }

  useEffect(() => {
    if (!getUserId()) {
        alert("Anda belum login!")
        navigate("/login")
    }
  }, [navigate])

  // --- 5. AMBIL DATA RUTE ---
  const [routes, setRoutes] = useState<RouteType[]>([])
  const [routeId, setRouteId] = useState("")

  useEffect(() => {
    fetch(API.RUTE) 
      .then((r) => r.json())
      .then((d) => {
          console.log("DATA RUTE DARI BACKEND:", d) // Cek Console F12 kalau masih penasaran
          const list = Array.isArray(d) ? d : d.data || []
          setRoutes(list)
      })
      .catch((e) => console.error("Gagal load rute", e))
  }, [])

  // --- 6. STATE PENUMPANG ---
  const [penumpang, setPenumpang] = useState<Passenger[]>([])

  // Template Data Baru
  const createPassenger = (tipe: "DEWASA" | "ANAK-ANAK" | "BAYI", indexUrut: number): Passenger => ({
    id_unik: Date.now() + Math.random(),
    tipe,
    label: tipe === "DEWASA" ? `Dewasa ${indexUrut}` : tipe === "ANAK-ANAK" ? `Anak ${indexUrut}` : `Bayi ${indexUrut}`,
    bayi: tipe === "BAYI",
    nama: "", nik: "", noHp: "", jenisKelamin: "", alamatRumah: "",
    tanggalLahir: "",
    jenisIdentitas: tipe === "DEWASA" ? "KTP" : "KIA",
    jenisBarang: "Tas Ransel",
    ukuranBarang: "Kecil",
    fotoBukti: null,
    isExpanded: true 
  })

  // --- 7. LOGIC AUTO FORM (TAMBAH/KURANG) ---
  const countType = (t: string) => penumpang.filter(p => p.tipe === t).length

  const handleAddAuto = (tipe: "DEWASA" | "ANAK-ANAK" | "BAYI") => {
    if (penumpang.length >= 6) return alert("Maksimal 6 penumpang per akun!")
    
    // Validasi: Anak/Bayi butuh Dewasa
    const jumlahDewasa = countType("DEWASA")
    if ((tipe === "ANAK-ANAK" || tipe === "BAYI") && jumlahDewasa === 0) {
        return alert("Harus ada penumpang DEWASA dulu sebelum tambah Anak/Bayi!")
    }

    const currentCount = countType(tipe)
    const newP = createPassenger(tipe, currentCount + 1)
    setPenumpang(curr => [...curr, newP])
  }

  const handleRemoveAuto = (tipe: "DEWASA" | "ANAK-ANAK" | "BAYI") => {
    // Logic: Cari penumpang TERAKHIR dari tipe ini, lalu hapus
    const newArr = [...penumpang]
    let lastIndex = -1
    for (let i = newArr.length - 1; i >= 0; i--) {
        if (newArr[i].tipe === tipe) {
            lastIndex = i
            break
        }
    }

    if (lastIndex !== -1) {
        newArr.splice(lastIndex, 1) // Hapus
        setPenumpang(newArr)
    }
  }

  // Hapus Spesifik (Tombol Sampah)
  const removeSpecific = (index: number) => {
    if(!confirm("Hapus penumpang ini?")) return
    setPenumpang(prev => prev.filter((_, i) => i !== index))
  }

  // Isi Data Pemilik
  const update = (i: number, k: keyof Passenger, v: any) => {
    setPenumpang((p) =>
      p.map((x, idx) => idx === i ? { ...x, [k]: v, ...(k === "fotoBukti" && v ? { fotoPreview: URL.createObjectURL(v) } : {}) } : x)
    )
  }
  
  const isiDataPemilik = (index: number) => {
      const nama = localStorage.getItem("nama")?.replace(/"/g, "") || ""
      if(nama) update(index, "nama", nama)
  }

  // --- 8. SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSubmit(true)
    const userId = getUserId()
    
    if (countType("DEWASA") === 0) {
        setLoadingSubmit(false)
        return alert("Wajib ada minimal 1 Penumpang Dewasa!")
    }

    try {
        const fd = new FormData()

        for (const p of penumpang) {
            // Validasi Kosong
            if (!p.nama || !p.nik || !p.jenisKelamin || !p.tanggalLahir || !p.fotoBukti || !p.alamatRumah) {
                throw new Error(`Data ${p.label} belum lengkap!`)
            }
            if (p.nik.length !== 16) throw new Error(`NIK ${p.label} harus 16 digit!`)

            // Validasi Umur
            const age = calculateAge(p.tanggalLahir)
            if (p.tipe === "DEWASA" && age < 17) throw new Error(`${p.label}: Umur ${age} thn (Dewasa harus 17+)`)
            if (p.tipe === "ANAK-ANAK" && (age < 5 || age >= 17)) throw new Error(`${p.label}: Umur ${age} thn (Anak harus 5-16 thn)`)
            if (p.tipe === "BAYI" && age >= 5) throw new Error(`${p.label}: Umur ${age} thn (Bayi harus < 5 thn)`)

            // Append FormData
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
            headers: { "userId": userId || "" },
            body: fd
        })

        const text = await res.text()
        let json
        try { json = JSON.parse(text) } catch { throw new Error("Server Error") }

        if (!res.ok) throw new Error(json.error || "Gagal mendaftar")

        alert(`✅ BERHASIL! ${json.pesan}`)
        navigate("/dashboard")

    } catch (err: any) {
        alert("❌ " + err.message)
    } finally {
        setLoadingSubmit(false)
    }
  }

  const selectedRoute = routes.find(r => r.rute_id.toString() === routeId)

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center pb-24 font-sans text-slate-800">
      <div className="w-full max-w-4xl">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-3xl shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bus className="text-yellow-400"/> Pendaftaran Mudik
          </h1>
          <p className="mt-2 text-sm text-blue-100">Otomatis tambah form. Max 6 Penumpang.</p>
        </div>

        <div className="bg-white rounded-b-3xl shadow-xl p-6 space-y-8">
          
          {/* STEP 1: PILIH RUTE */}
          <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <label className="block mb-3 font-bold text-slate-700 flex items-center gap-2">
              <MapPin size={18} className="text-red-500"/> Pilih Tujuan & Jadwal
            </label>
            <div className="relative">
                <select
                  className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium"
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                >
                  <option value="">-- Pilih Kota Tujuan --</option>
                  {routes.map((r) => {
                      const tgl = getRuteDate(r) // Helper ambil tanggal
                      return (
                          <option key={r.rute_id} value={r.rute_id} disabled={r.kuota_tersisa <= 0}>
                              {r.tujuan} — {formatDateTime(tgl)} {r.kuota_tersisa <= 0 ? "(PENUH)" : `(Sisa: ${r.kuota_tersisa})`}
                          </option>
                      )
                  })}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20}/>
            </div>
            
            {/* INFO RUTE TERPILIH */}
            {selectedRoute && (
                <div className="mt-4 flex flex-col md:flex-row gap-3 text-blue-800 text-sm bg-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2">
                         <Bus size={18}/> <span>Bus: <b>{getRuteBus(selectedRoute)}</b></span>
                    </div>
                    <div className="hidden md:block text-blue-300">|</div>
                    <div className="flex items-center gap-2">
                        <Clock size={18}/> <span>Berangkat: <b>{formatDateTime(getRuteDate(selectedRoute))}</b></span>
                    </div>
                </div>
            )}
          </section>

          {/* STEP 2: CONTROLLER (AUTO FORM) */}
          <section>
            <label className="block font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Users size={18} className="text-blue-600"/> Tambah Penumpang
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* DEWASA */}
               <ControlCard 
                 label="Dewasa (17+)" 
                 count={countType("DEWASA")} 
                 onAdd={() => handleAddAuto("DEWASA")} 
                 onRemove={() => handleRemoveAuto("DEWASA")} 
               />
               {/* ANAK */}
               <ControlCard 
                 label="Anak (5-16)" 
                 count={countType("ANAK-ANAK")} 
                 onAdd={() => handleAddAuto("ANAK-ANAK")} 
                 onRemove={() => handleRemoveAuto("ANAK-ANAK")} 
               />
               {/* BAYI */}
               <ControlCard 
                 label="Bayi (<5)" 
                 count={countType("BAYI")} 
                 onAdd={() => handleAddAuto("BAYI")} 
                 onRemove={() => handleRemoveAuto("BAYI")} 
               />
            </div>
          </section>

          {/* STEP 3: LIST FORM PENUMPANG */}
          {penumpang.length > 0 && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 text-sm">
                <AlertCircle size={18}/> <span>Total: <b>{penumpang.length} Penumpang</b>. Silakan lengkapi data.</span>
              </div>

              {penumpang.map((p, i) => (
                <div key={p.id_unik} className={`border rounded-2xl bg-white overflow-hidden transition-all duration-300 ${p.isExpanded ? "ring-2 ring-blue-100 border-blue-300 shadow-md" : "border-slate-200"}`}>
                  
                  {/* HEADER CARD */}
                  <div 
                    onClick={() => setPenumpang(curr => curr.map((x, idx) => idx === i ? { ...x, isExpanded: !x.isExpanded } : x))}
                    className={`p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 ${p.isExpanded ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.nama ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                            {p.nama ? <CheckCircle size={16}/> : (i + 1)}
                        </span>
                        <div>
                            <p className="font-bold text-slate-800">{p.label}</p>
                            <p className="text-xs text-slate-500">{p.nama || "Klik untuk isi data..."}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeSpecific(i); }} 
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Hapus Penumpang Ini"
                        >
                            <Trash2 size={18} />
                        </button>
                        {p.isExpanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                    </div>
                  </div>

                  {/* ISI FORM */}
                  {p.isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                      
                      {p.tipe === "DEWASA" && !p.nama && (
                          <div className="mb-4 flex justify-end">
                              <button type="button" onClick={() => isiDataPemilik(i)} className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                  <User size={12}/> Isi dengan Data Akun Saya
                              </button>
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>Nama Lengkap</Label>
                          <Input value={p.nama} onChange={(e: any) => update(i, "nama", e.target.value)} placeholder="Sesuai Identitas" />
                        </div>
                        <div>
                          <Label>NIK (16 Digit)</Label>
                          <Input type="number" value={p.nik} onChange={(e: any) => update(i, "nik", e.target.value)} placeholder="11xxxxxxxxxxxxxx" />
                        </div>
                        <div>
                          <Label>Tanggal Lahir</Label>
                          <Input type="date" value={p.tanggalLahir} onChange={(e: any) => update(i, "tanggalLahir", e.target.value)} />
                          {/* Hint Umur */}
                          {p.tanggalLahir && (
                              <p className="text-xs mt-1 font-bold">
                                  Umur: {calculateAge(p.tanggalLahir)} Thn
                                  {p.tipe === "DEWASA" && calculateAge(p.tanggalLahir) < 17 && <span className="text-red-500 ml-1">(Harus 17+)</span>}
                                  {p.tipe === "ANAK-ANAK" && (calculateAge(p.tanggalLahir) < 5 || calculateAge(p.tanggalLahir) >= 17) && <span className="text-red-500 ml-1">(Harus 5-16)</span>}
                                  {p.tipe === "BAYI" && calculateAge(p.tanggalLahir) >= 5 && <span className="text-red-500 ml-1">(Harus &lt;5)</span>}
                              </p>
                          )}
                        </div>
                        <div>
                          <Label>Jenis Kelamin</Label>
                          <Select value={p.jenisKelamin} onChange={(e: any) => update(i, "jenisKelamin", e.target.value)}>
                            <option value="">-- Pilih --</option>
                            <option value="LAKI-LAKI">Laki-laki</option>
                            <option value="PEREMPUAN">Perempuan</option>
                          </Select>
                        </div>
                        <div>
                          <Label>Identitas ({p.tipe})</Label>
                          <Select value={p.jenisIdentitas} onChange={(e: any) => update(i, "jenisIdentitas", e.target.value)}>
                            {p.tipe === "DEWASA" ? <option value="KTP">KTP</option> : <><option value="KIA">KIA</option><option value="KK">KK</option></>}
                          </Select>
                        </div>
                        <div>
                          <Label>No. HP (Opsional)</Label>
                          <Input type="tel" value={p.noHp} onChange={(e: any) => update(i, "noHp", e.target.value)} placeholder="08xxxxxxxxxx" />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Alamat Rumah</Label>
                          <Input value={p.alamatRumah} onChange={(e: any) => update(i, "alamatRumah", e.target.value)} placeholder="Jalan, Desa..." />
                        </div>

                        <div className="md:col-span-2 border-t pt-4">
                            <p className="text-sm font-bold text-slate-700 mb-2 flex gap-2"><Briefcase size={16}/> Barang & Foto</p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Select value={p.jenisBarang} onChange={(e: any) => update(i, "jenisBarang", e.target.value)}>
                                    <option value="Tas Ransel">Tas Ransel</option>
                                    <option value="Koper">Koper</option>
                                    <option value="Kardus">Kardus</option>
                                    <option value="Lainnya">Lainnya</option>
                                </Select>
                                <Select value={p.ukuranBarang} onChange={(e: any) => update(i, "ukuranBarang", e.target.value)}>
                                    <option value="Kecil">Kecil</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Besar">Besar</option>
                                </Select>
                            </div>

                            <div className={`border-2 border-dashed rounded-xl p-4 text-center relative ${p.fotoBukti ? "bg-green-50 border-green-400" : "hover:bg-slate-50"}`}>
                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => update(i, "fotoBukti", e.target.files?.[0])} />
                                {p.fotoPreview ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <img src={p.fotoPreview} className="h-16 object-contain rounded border" alt="preview"/>
                                        <span className="text-xs font-bold text-green-700">Foto OK ✅</span>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <UploadCloud size={20} className="mx-auto text-slate-400 mb-1"/>
                                        <p className="text-xs text-slate-500">Upload Foto Identitas</p>
                                    </div>
                                )}
                            </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-4 pt-4 border-t border-slate-200">
                 <button type="button" onClick={() => {if(confirm("Reset semua?")) setPenumpang([])}} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition">Reset</button>
                 <button type="submit" disabled={loadingSubmit} className="flex-[2] py-4 bg-blue-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition disabled:opacity-70">
                    {loadingSubmit ? "Mengirim Data..." : "Kirim Pendaftaran"}
                 </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

// --- SMALL COMPONENTS ---
const ControlCard = ({label, count, onAdd, onRemove}: any) => (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border shadow-sm">
      <span className="font-bold text-sm mb-2 text-slate-600">{label}</span>
      <div className="flex items-center gap-4">
        <button onClick={onRemove} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center transition"><Minus size={18}/></button>
        <span className="text-2xl font-bold w-6 text-center">{count}</span>
        <button onClick={onAdd} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"><Plus size={18}/></button>
      </div>
    </div>
)
const Label = ({children}: any) => <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{children}</label>
const Input = (props: any) => <input {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"/>
const Select = (props: any) => <div className="relative"><select {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition">{props.children}</select><ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/></div>