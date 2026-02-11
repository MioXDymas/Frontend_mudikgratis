import React, { useState } from "react"
import { motion } from "framer-motion"
import heroMobile from "../assets/hero-mobile.png"
import heroDesktop from "../assets/hero-dekstop.png"
import logoDishub from "../assets/logo-dishub.png"
import logoseulamat from "../assets/logo3.png"

// Placeholder Ilustrasi Bus (Ganti dengan file GIF/PNG Anda sendiri nanti)
const busIllustration = logoseulamat

import {
  ClipboardCheck,
  ShieldCheck,
  MapPin,
  Bus,
  Sparkles,
  PlayCircle,
  Youtube
} from "lucide-react"

export default function Home() {
  
  // State untuk kontrol animasi (gerak saat tap di mobile)
  const [isAnimating, setIsAnimating] = useState(false)

  // Data Dummy untuk Video
  const videos = [
    {
      id: "K9Wailk3Yzo", 
      title: "Keseruan Pelepasan Mudik Gratis Tahun Lalu",
      desc: "Momen pelepasan armada bus oleh Gubernur Aceh."
    },
    {
      id: "8eQx0qiOOFw", 
      title: "Recap Pelepasan Mudik Gratis Tahun 2025",
      desc: "Apa kata mereka yang sudah pernah ikut program ini?"
    },
    {
      id: "6HjG4UMIBoc", 
      title: "Persiapan Mudik Gratis",
      desc: "Panduan persiapan sebelum berangkat ke kampung halaman."
    }
  ]

  // Konfigurasi Animasi "Bergerak"
  const shakeVariant = {
    idle: { x: 0, y: 0, rotate: 0 },
    moving: {
      x: [-1, 1, -1, 1], // Efek bergetar kiri-kanan
      y: [0, -2, 0],     // Efek suspensi naik-turun
      rotate: [0, 1, 0, -1, 0], // Sedikit goyang
      transition: {
        duration: 0.2,
        repeat: Infinity, // Ulangi terus selama state aktif
        ease: "linear"
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] md:min-h-[85vh] overflow-hidden text-white flex items-center">

        <a
          href="/admin/login"
          className="
            hidden md:flex
            absolute top-6 right-6 z-20
            items-center justify-center
            rounded-xl
            border border-white/40
            px-5 py-2
            text-sm font-semibold text-white/90
            hover:bg-white/10 transition
          "
        >
          Login Admin
        </a>

        {/* Background Images */}
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: `url(${heroMobile})` }}
        />
        <div
          className="absolute inset-0 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: `url(${heroDesktop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-800/80 to-blue-900/90" />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center mt-10 md:mt-0">
          
          {/* KOLOM KIRI: TEKS & TOMBOL */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3">
              <img src={logoDishub} alt="Dishub Aceh" className="h-14 w-auto drop-shadow-lg" />
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Mudik <span className="text-yellow-300">Gratis</span><br />
              Bersama Seulamat
            </h1>

            <p className="mt-4 text-lg text-white/90 max-w-lg leading-relaxed">
              Sistem Elektronik Layanan Mudik Aceh Terpadu. <br/>
              Pulang kampung aman, nyaman, dan tanpa biaya.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="/register"
                className="rounded-xl bg-orange-500 px-8 py-4 text-center text-base font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 transition transform"
              >
                Daftar Sekarang
              </a>

              <a
                href="/login"
                className="rounded-xl bg-white px-8 py-4 text-center text-base font-bold text-blue-700 shadow hover:bg-slate-100 hover:scale-105 transition transform"
              >
                Login Peserta
              </a>

              <a
                href="/admin/login"
                className="md:hidden rounded-xl border border-white/40 px-8 py-4 text-center text-base font-bold text-white/90 hover:bg-white/10 transition"
              >
                Login Admin
              </a>
            </div>
          </motion.div>

          {/* KOLOM KANAN: GIF / ILUSTRASI BERGERAK */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center md:justify-end relative"
          >
            {/* Background Glow Effect di belakang bus */}
            <div className="absolute inset-0 bg-blue-400/20 blur-[80px] rounded-full animate-pulse" />

            <motion.img
              src={busIllustration} // Ganti variable ini dengan import file GIF/PNG Anda
              alt="Ilustrasi Mudik Bus"
              className="relative z-10 w-64 md:w-96 drop-shadow-2xl cursor-pointer object-contain"
              
              // Animasi Framer Motion
              variants={shakeVariant}
              animate={isAnimating ? "moving" : "idle"}
              
              // Event Handlers
              onMouseEnter={() => setIsAnimating(true)} // Desktop: Bergerak pas hover
              onMouseLeave={() => setIsAnimating(false)} // Desktop: Berhenti pas mouse keluar
              onClick={() => setIsAnimating(!isAnimating)} // Mobile: Tap untuk gerak/stop
              whileTap={{ scale: 0.95 }} // Efek klik
            />
            
            {/* Tooltip kecil untuk user mobile */}
            <div className="absolute -bottom-8 md:hidden text-white/60 text-xs animate-bounce">
              Tap gambar untuk menjalankan mesin! 👆
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative -mt-8 bg-white rounded-t-[2.5rem] px-5 py-12 z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.05)]">
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <Feature icon={<ClipboardCheck size={26} />} title="Pendaftaran" subtitle="Mudah" />
          <Feature icon={<ShieldCheck size={26} />} title="Perjalanan" subtitle="Aman" />
          <Feature icon={<MapPin size={26} />} title="Tujuan" subtitle="Beragam" />
        </motion.div>
      </section>

      {/* ================= INFO MUDIK ================= */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white px-5 py-24">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob delay-2000" />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              Program Resmi Pemerintah Aceh
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 leading-tight">
              Mudik Tenang, <br/>
              <span className="text-blue-600">Pulang Senang</span>
            </h2>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Seulamat hadir sebagai solusi mudik gratis yang aman, tertib,
              dan terorganisir untuk masyarakat Aceh.
              Semua armada, jadwal, dan rute telah dipersiapkan secara resmi.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="
              relative rounded-3xl bg-white p-10
              shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] 
              border border-slate-100
              hover:-translate-y-2 transition-all duration-500
            "
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <Bus size={40} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">
                  Transportasi Resmi
                </p>
                <p className="text-slate-600 mt-1">
                  Armada bus pariwisata AC yang layak jalan & diawasi langsung oleh Dishub.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= GALERI VIDEO ================= */}
      <section className="bg-slate-50 px-5 py-24 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
              <Youtube className="text-red-600 w-8 h-8 md:w-10 md:h-10" /> Galeri Mudik
            </h3>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Dokumentasi dan keseruan perjalanan mudik bersama Seulamat tahun sebelumnya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {videos.map((vid, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="
                  group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200
                  hover:shadow-xl hover:-translate-y-2 transition-all duration-300
                  flex flex-col h-full
                "
              >
                <div className="relative w-full pt-[60%] bg-slate-900 group-hover:opacity-90 transition"> 
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${vid.id}`}
                    title={vid.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start gap-3 mb-3">
                    <PlayCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                    <h4 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition">
                      {vid.title}
                    </h4>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {vid.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= LINK INFORMASI RESMI ================= */}
      <section className="bg-white px-5 py-24">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-8 mb-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Informasi Resmi
              </h3>
              <p className="mt-2 text-slate-600">
                Pengumuman langsung dari Dinas Perhubungan Aceh.
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="https://dishub.acehprov.go.id/2025/03/27/gubernur-aceh-luncurkan-program-mudik-gratis/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group rounded-2xl border border-slate-100
                bg-white overflow-hidden
                shadow-sm transition-all
                hover:shadow-xl hover:-translate-y-1
              "
            >
              <div className="h-48 bg-blue-50 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition duration-500"></div>
                <img src={logoDishub} className="h-16 opacity-80 group-hover:scale-110 transition duration-500" alt="Dishub" />
                <span className="mt-3 text-blue-800 font-bold text-xs tracking-widest">DISHUB ACEH</span>
              </div>

              <div className="p-6">
                <div className="text-xs font-semibold text-orange-500 mb-2">BERITA TERBARU</div>
                <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition leading-snug">
                  Gubernur Aceh Luncurkan Program Mudik Gratis
                </h4>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                  Pelepasan armada secara simbolis menandai dimulainya layanan mudik gratis tahun ini.
                </p>
                <div className="mt-5 flex items-center text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                  Baca Selengkapnya <span>→</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}

/* ================= COMPONENT: FEATURE CARD ================= */
function Feature({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group flex flex-col items-center gap-4"
    >
      <div
        className="
          w-16 h-16 rounded-2xl
          bg-blue-50 text-blue-600
          flex items-center justify-center
          transition-all duration-300
          shadow-sm
          group-hover:-translate-y-2
          group-hover:shadow-lg
          group-hover:shadow-blue-200
          group-hover:bg-blue-600
          group-hover:text-white
        "
      >
        {React.cloneElement(icon as React.ReactElement, { size: 30 })}
      </div>

      <p className="text-sm font-bold text-slate-700 text-center leading-tight">
        {title}<br />
        <span className="text-slate-500 font-normal group-hover:text-blue-600 transition">{subtitle}</span>
      </p>
    </motion.div>
  )
}