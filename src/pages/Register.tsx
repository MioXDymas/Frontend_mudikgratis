import { useNavigate } from "react-router-dom"
import { useState } from "react"
import heroMobile from "../assets/hero-mobile.png"
import heroDesktop from "../assets/hero-dekstop.png"
import Modal from "../components/Modal"
import { API } from "../lib/api"
import { UserPlus, Lock } from "lucide-react"

export default function Register() {
  const navigate = useNavigate()

  // =====================
  // STATE FORM (TETAP)
  // =====================
  const [nama, setNama] = useState("")
  const [nik, setNik] = useState("")
  const [email, setEmail] = useState("")
  const [hp, setHp] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [gender, setGender] = useState("")

  // =====================
  // STATE MODAL & LOADING (TETAP)
  // =====================
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalMsg, setModalMsg] = useState("")
  const [loading, setLoading] = useState(false)

  // =====================
  // SUBMIT (TETAP)
  // =====================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nama || !nik || !email || !hp || !password || !confirm || !gender) {
      setModalTitle("Registrasi Gagal")
      setModalMsg("Semua field wajib diisi.")
      setShowModal(true)
      return
    }

    if (!/^\d{16}$/.test(nik)) {
      setModalTitle("NIK Tidak Valid")
      setModalMsg("NIK harus terdiri dari 16 digit angka.")
      setShowModal(true)
      return
    }

    if (password !== confirm) {
      setModalTitle("Password Tidak Cocok")
      setModalMsg("Password dan ulangi password harus sama.")
      setShowModal(true)
      return
    }

    try {
      setLoading(true)

      const res = await fetch(API.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_lengkap: nama,
          email,
          password,
          nik,
          no_hp: hp,
        }),
      })

      if (!res.ok) throw new Error()

      setModalTitle("Verifikasi Email")
      setModalMsg(
        `Akun berhasil dibuat.\n\nSilakan cek email berikut untuk verifikasi:\n${email}`
      )
      setShowModal(true)
    } catch {
      setModalTitle("Registrasi Gagal")
      setModalMsg("Terjadi kesalahan. Silakan coba lagi.")
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <section className="relative min-h-screen px-5">

        {/* BACKGROUND (SAMA LOGIN) */}
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: `url(${heroMobile})` }}
        />
        <div
          className="absolute inset-0 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: `url(${heroDesktop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 to-blue-950/95" />

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-5xl py-10">

            <button
              onClick={() => navigate("/")}
              className="mb-8 text-sm text-white/80 hover:text-white flex items-center gap-2 transition"
            >
              ← Kembali ke Beranda
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

              {/* FORM */}
              <div className="bg-white rounded-3xl shadow-2xl px-8 py-10 animate-fade-in-up">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    <UserPlus className="text-blue-600" />
                    Daftar Akun
                  </h1>
                  <p className="mt-2 text-slate-500">
                    Isi data sesuai identitas resmi.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input label="Nama Lengkap" placeholder="Sesuai KTP" required onChange={setNama} />
                  <Input label="NIK" placeholder="16 digit NIK" required onChange={setNik} />

                  {/* GENDER */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800
                      focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    >
                      <option value="">-- Pilih Jenis Kelamin --</option>
                      <option value="LAKI_LAKI">Laki-laki</option>
                      <option value="PEREMPUAN">Perempuan</option>
                    </select>
                  </div>

                  <Input label="Email" placeholder="email@example.com" required onChange={setEmail} />
                  <Input label="Nomor HP" placeholder="08xxxxxxxxxx" required onChange={setHp} />
                  <Input label="Password" type="password" placeholder="••••••••" required onChange={setPassword} />
                  <Input label="Ulangi Password" type="password" placeholder="••••••••" required onChange={setConfirm} />

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-2 rounded-xl py-3.5 text-white font-bold text-lg shadow-lg shadow-blue-200 transition transform active:scale-95 ${
                      loading
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Memproses..." : "Daftar Sekarang"}
                  </button>
                </form>

                {/* TRUST */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 py-3 rounded-lg border">
                  <Lock size={14} />
                  Data Anda aman & terenkripsi.
                </div>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Sudah punya akun?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                  >
                    Login disini
                  </span>
                </p>
              </div>

              {/* INFO (DESKTOP) */}
              <div className="hidden md:block text-white space-y-8 px-6 self-start">
                <h2 className="text-4xl font-extrabold leading-tight">
                  Ayo Mendaftarkan
                  Diri Anda!
                </h2>
                <p className="text-blue-100 text-lg">
                  Daftarkan diri Anda untuk mengikuti program mudik gratis dengan mudah dan aman.
                </p>

                <InfoBox title="Validasi Data" desc="Data diverifikasi sesuai identitas resmi." />
                <InfoBox title="Isi Data Dengan Benar" desc="Keamanan akun sudah menjadi tanggung jawab anda." />
              </div>

            </div>
          </div>
        </div>
      </section>

      <Modal
        open={showModal}
        title={modalTitle}
        message={modalMsg}
        onClose={() => {
          setShowModal(false)
          if (modalTitle === "Verifikasi Email") navigate("/login")
        }}
      />
    </main>
  )
}

// ===================== COMPONENTS (SAMA STYLE LOGIN)
function Input({
  label,
  type = "text",
  placeholder,
  required = false,
  onChange,
}: {
  label: string
  type?: string
  placeholder: string
  required?: boolean
  onChange: (val: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
      />
    </div>
  )
}

function InfoBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold text-xl">
        ✓
      </div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-blue-100">{desc}</p>
      </div>
    </div>
  )
}
