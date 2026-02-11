import { useNavigate } from "react-router-dom"
import { useState } from "react"
import heroMobile from "../assets/hero-mobile.png"
import heroDesktop from "../assets/hero-dekstop.png"
import Modal from "../components/Modal"
import { API } from "../lib/api"
import { Eye, EyeOff, Lock, LogIn } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()

  // =====================
  // STATE FORM
  // =====================
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // =====================
  // STATE MODAL & LOADING
  // =====================
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalMsg, setModalMsg] = useState("")
  const [loading, setLoading] = useState(false)

  // =====================
  // HELPER: DECODE JWT (Opsional, buat debug aja)
  // =====================
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }

  // =====================
  // SUBMIT LOGIN (YANG DIPERBAIKI)
  // =====================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      setModalTitle("Login Gagal")
      setModalMsg("Email dan password wajib diisi.")
      setShowModal(true)
      return
    }

    setLoading(true)

    try {
      const res = await fetch(API.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setModalTitle("Login Gagal")
        setModalMsg(data?.message || "Email atau password salah.")
        setShowModal(true)
        return
      }

      // 🔥 FIX LOGIC DI SINI:
      // Asal ada token, langsung sikat! Jangan cek id_user dulu.
      if (data?.token) {
        // 1. Simpan Token (Paling Penting)
        localStorage.setItem("token", data.token)
        
        // 2. Simpan Nama (Kalau ada)
        if (data.nama) localStorage.setItem("nama", data.nama)

        // 3. Coba ambil userId (Opsional, kalau gak ada gak apa2)
        const decoded = parseJwt(data.token)
        if (decoded?.id_user) {
           localStorage.setItem("userId", String(decoded.id_user))
        } else if (decoded?.sub) {
           // Fallback: simpan email/sub kalau id_user ga ada
           localStorage.setItem("userEmail", decoded.sub)
        }

        // 4. Sukses -> Trigger Modal
        setModalTitle("Login Berhasil")
        setModalMsg(`Selamat datang kembali, ${data.nama ?? "User"}!`)
        setShowModal(true)
      } else {
        throw new Error("Token tidak diterima dari server.")
      }

    } catch (err: any) {
      console.error(err)
      setModalTitle("Login Gagal")
      setModalMsg(err.message || "Tidak dapat terhubung ke server.")
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <section className="relative min-h-screen px-5">
        {/* BACKGROUND */}
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
                    <LogIn className="text-blue-600"/> Login Akun
                    </h1>
                    <p className="mt-2 text-slate-500">
                    Masuk untuk mengakses layanan mudik gratis.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    onChange={setEmail}
                  />

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 font-medium
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                      >
                        Lupa password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-2 rounded-xl py-3.5 text-white font-bold text-lg shadow-lg shadow-blue-200 transition transform active:scale-95 ${
                      loading
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Memproses..." : "Masuk Sekarang"}
                  </button>
                </form>

                {/* TRUST */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 py-3 rounded-lg border border-slate-100">
                  <Lock size={14} />
                  Koneksi Anda terenkripsi dan aman.
                </div>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Belum punya akun?{" "}
                  <span
                    onClick={() => navigate("/register")}
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                  >
                    Daftar disini
                  </span>
                </p>
              </div>

              {/* INFO (Desktop Only) */}
              <div className="hidden md:block text-white space-y-8 px-6">
                <div>
                    <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                        Selamat Datang Kembali!
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        Silakan login untuk memantau status pendaftaran, mengunduh tiket, atau mendaftarkan anggota keluarga lainnya.
                    </p>
                </div>

                <div className="space-y-4">
                    <InfoBox title="Cek Status" desc="Pantau verifikasi berkas secara realtime." />
                    <InfoBox title="Unduh Tiket" desc="Dapatkan e-tiket resmi setelah disetujui." />
                </div>
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
          // Redirect ke dashboard kalau login berhasil
          if (modalTitle === "Login Berhasil") {
            navigate("/dashboard")
          }
        }}
      />
    </main>
  )
}

// =====================
// COMPONENTS
// =====================
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
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm placeholder:font-normal"
      />
    </div>
  )
}

function InfoBox({ title, desc }: { title: string, desc: string }) {
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