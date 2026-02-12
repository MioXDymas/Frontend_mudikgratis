import React, { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom" // Pastikan sudah install react-router-dom

// Assets
import heroMobile from "../assets/hero-mobile.png"
import heroDesktop from "../assets/hero-dekstop.png"
import logoDishub from "../assets/LOGO 26-29.png"
import logoseulamat from "../assets/Seulamat Logo-04.png"
import logoPemprov from "../assets/pemprov aceh.png" // 🔥 Import Logo Baru

import {
  ClipboardCheck,
  ShieldCheck,
  MapPin,
  Bus,
  Sparkles,
  PlayCircle,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Mail,
  Phone,
  Info
} from "lucide-react"

export default function Home() {
  const navigate = useNavigate()
  const [isAnimating, setIsAnimating] = useState(false)

  const busIllustration = logoseulamat

  const videos = [
    { id: "K9Wailk3Yzo", title: "Keseruan Pelepasan Mudik Gratis", desc: "Momen pelepasan armada bus oleh Gubernur Aceh." },
    { id: "8eQx0qiOOFw", title: "Recap Mudik Gratis 2025", desc: "Apa kata mereka yang sudah pernah ikut program ini?" },
    { id: "6HjG4UMIBoc", title: "Persiapan Mudik Gratis", desc: "Panduan persiapan sebelum berangkat ke kampung halaman." }
  ]

  const shakeVariant = {
    idle: { x: 0, y: 0, rotate: 0 },
    moving: {
      x: [-1, 1, -1, 1],
      y: [0, -2, 0],
      rotate: [0, 1, 0, -1, 0],
      transition: { duration: 0.2, repeat: Infinity, ease: "linear" }
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] md:min-h-[85vh] overflow-hidden text-white flex items-center">
        
        {/* Tombol Login Admin Desktop */}
        <a href="/admin/login" className="hidden md:flex absolute top-6 right-6 z-20 items-center justify-center rounded-xl border border-white/40 px-5 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition">
          Login Admin
        </a>

        <div className="absolute inset-0 bg-cover bg-center md:hidden" style={{ backgroundImage: `url(${heroMobile})` }} />
        <div className="absolute inset-0 hidden bg-cover bg-center md:block" style={{ backgroundImage: `url(${heroDesktop})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-800/80 to-blue-900/90" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center mt-10 md:mt-0">
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            {/* 🔥 HEADER LOGO: PEMPROV + DISHUB */}
            <div className="flex items-center gap-4 bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md border border-white/20">
              <img src={logoPemprov} alt="Pemprov Aceh" className="h-12 w-auto drop-shadow-md" />
              <div className="h-8 w-px bg-white/30"></div>
              <img src={logoDishub} alt="Dishub Aceh" className="h-12 w-auto drop-shadow-md" />
            </div>

            <h1 className="mt-8 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Mudik <span className="text-yellow-300">Gratis</span><br />
              Bersama Seulamat
            </h1>

            <p className="mt-4 text-lg text-white/90 max-w-lg leading-relaxed">
              Sistem Elektronik Layanan Mudik Aceh Terpadu. <br/>
              Pulang kampung aman, nyaman, dan tanpa biaya.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button onClick={() => navigate("/register")} className="rounded-xl bg-orange-500 px-8 py-4 text-center text-base font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition transform hover:scale-105">
                Daftar Sekarang
              </button>
              <button onClick={() => navigate("/login")} className="rounded-xl bg-white px-8 py-4 text-center text-base font-bold text-blue-700 shadow hover:bg-slate-100 transition transform hover:scale-105">
                Login Peserta
              </button>
              <a href="/admin/login" className="md:hidden rounded-xl border border-white/40 px-8 py-4 text-center text-base font-bold text-white/90">
                Login Admin
              </a>
            </div>
          </motion.div>

          {/* KOLOM KANAN: BUS ILLUSTRATION */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex justify-center md:justify-end relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-[80px] rounded-full animate-pulse" />
            <motion.img
              src={busIllustration}
              alt="Seulamat Logo"
              className="relative z-10 w-64 md:w-96 drop-shadow-2xl cursor-pointer object-contain"
              variants={shakeVariant}
              animate={isAnimating ? "moving" : "idle"}
              onMouseEnter={() => setIsAnimating(true)}
              onMouseLeave={() => setIsAnimating(false)}
              onClick={() => setIsAnimating(!isAnimating)}
              whileTap={{ scale: 0.95 }}
            />
            <div className="absolute -bottom-8 md:hidden text-white/60 text-xs animate-bounce">
              Tap logo untuk menjalankan mesin! 👆
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative -mt-8 bg-white rounded-t-[2.5rem] px-5 py-12 z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.05)]">
        <motion.div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}>
          <Feature icon={<ClipboardCheck size={26} />} title="Pendaftaran" subtitle="Mudah" />
          <Feature icon={<ShieldCheck size={26} />} title="Perjalanan" subtitle="Aman" />
          <Feature icon={<MapPin size={26} />} title="Tujuan" subtitle="Beragam" />
        </motion.div>
      </section>

      {/* ================= INFO SECTION ================= */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white px-5 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} /> Program Resmi Pemerintah Aceh
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 leading-tight">
              Mudik Tenang, <br/><span className="text-blue-600">Pulang Senang</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Seulamat (Sistem Elektronik Layanan Mudik Aceh Terpadu) hadir sebagai solusi mudik gratis yang aman dan terorganisir bagi warga Aceh.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="relative rounded-3xl bg-white p-10 shadow-xl border border-slate-100 hover:-translate-y-2 transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <Bus size={40} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">Transportasi Resmi</p>
                <p className="text-slate-600 mt-1">Armada bus pariwisata layak jalan yang diawasi langsung oleh Dishub Aceh.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= GALERI VIDEO ================= */}
      <section className="bg-slate-50 px-5 py-24 border-t border-slate-200">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-3 mb-16">
            <Youtube className="text-red-600 w-10 h-10" /> Galeri Mudik
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {videos.map((vid, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-xl transition-all">
                <div className="relative pt-[56.25%]">
                  <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${vid.id}`} title={vid.title} allowFullScreen />
                </div>
                <div className="p-6 text-left">
                  <h4 className="font-bold text-slate-800 text-lg mb-2">{vid.title}</h4>
                  <p className="text-slate-500 text-sm">{vid.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER 🔥 ================= */}
      <footer className="bg-blue-950 text-white pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Branding */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoPemprov} alt="Aceh" className="h-10 w-auto" />
                <img src={logoDishub} alt="Dishub" className="h-10 w-auto" />
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                Program Mudik Gratis Pemerintah Aceh melalui Dinas Perhubungan Aceh untuk memfasilitasi masyarakat pulang kampung dengan aman.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h5 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Globe size={18} className="text-yellow-400" /> Navigasi
              </h5>
              <ul className="space-y-4 text-blue-200 text-sm font-medium">
                <li><a href="/" className="hover:text-yellow-400 transition">Beranda</a></li>
                <li><a href="/login" className="hover:text-yellow-400 transition">Login Peserta</a></li>
                <li><a href="/register" className="hover:text-yellow-400 transition">Pendaftaran</a></li>
                <li><a href="/admin/login" className="hover:text-yellow-400 transition">Portal Admin</a></li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h5 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Phone size={18} className="text-yellow-400" /> Kontak Kami
              </h5>
              <ul className="space-y-4 text-blue-200 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-yellow-400" />
                  <span>Jl. Teuku Nyak Arief No. 219, Banda Aceh, Indonesia</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-yellow-400" />
                  <span>dishub@acehprov.go.id</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-yellow-400" />
                  <span>(0651) 123456</span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h5 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Instagram size={18} className="text-yellow-400" /> Ikuti Kami
              </h5>
              <div className="flex gap-4">
                <SocialLink icon={<Facebook size={20} />} href="https://facebook.com" />
                <SocialLink icon={<Instagram size={20} />} href="https://instagram.com" />
                <SocialLink icon={<Twitter size={20} />} href="https://twitter.com" />
              </div>
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold mb-2">Powered By</p>
                <img src={logoseulamat} alt="Seulamat" className="h-8 w-auto brightness-200" />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10 text-center">
            <p className="text-blue-400 text-xs">
              © {new Date().getFullYear()} Dinas Perhubungan Aceh. Hak Cipta Dilindungi Undang-Undang.
            </p>
          </div>
        </div>
      </footer>

    </main>
  )
}

/* ================= COMPONENTS ================= */

function Feature({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.5 }} className="group flex flex-col items-center gap-3">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:-translate-y-1">
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <p className="text-xs md:text-sm font-bold text-slate-700 leading-tight">
        {title}<br /><span className="text-slate-500 font-normal">{subtitle}</span>
      </p>
    </motion.div>
  )
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-yellow-400 hover:text-blue-900 transition duration-300">
      {icon}
    </a>
  )
}