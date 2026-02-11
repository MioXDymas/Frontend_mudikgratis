import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"

// --- PAGES USER ---
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import DaftarMudik from "./pages/DaftarMudik"
import Program from "./pages/Program"
import Bantuan from "./pages/Bantuan"

// --- PAGES ADMIN ---
import LoginAdmin from "./pages/LoginAdmin"
import AdminDashboard from "./pages/AdminDashboard"   // Halaman Utama (Stats + Menu)
import AdminPendaftar from "./pages/AdminPendaftar"   // Halaman Verifikasi
import AdminKendaraan from "./pages/AdminKendaraan"   // Halaman CRUD Bus
import Konfirmasi from "./pages/Konfirmasi"

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* PUBLIC */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/program" element={<PageWrapper><Program /></PageWrapper>} />
        <Route path="/bantuan" element={<PageWrapper><Bantuan /></PageWrapper>} />

        {/* USER */}
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/daftar-mudik" element={<PageWrapper><DaftarMudik /></PageWrapper>} />

        {/* ADMIN */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<PageWrapper><LoginAdmin /></PageWrapper>} />

        {/* ADMIN: DASHBOARD UTAMA */}
        <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />

        {/* ADMIN: MENU CRUD & VERIFIKASI */}
        <Route path="/admin/verifikasi" element={<PageWrapper><AdminPendaftar /></PageWrapper>} />
        <Route path="/admin/kendaraan" element={<PageWrapper><AdminKendaraan /></PageWrapper>} />
        <Route path="/konfirmasi/:userId" element={<PageWrapper><Konfirmasi /></PageWrapper>} />

      </Routes>
    </AnimatePresence>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}