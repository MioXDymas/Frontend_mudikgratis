// 1. AMBIL DARI ENV (Wajib buat file .env di root project)
// Isi .env: VITE_API_BASE_URL=http://localhost:8080
export const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Cek safety aja biar gak bingung kalau error
if (!BASE_URL) {
  console.error("❌ FATAL: VITE_API_BASE_URL tidak ditemukan di .env!")
}

/* ================= URL LIST ================= */
export const API = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  RUTE: `${BASE_URL}/api/rute`,
  PENDAFTARAN: `${BASE_URL}/api/pendaftaran`, 
  REGISTER: `${BASE_URL}/api/auth/register`, 
  
  // ADMIN
  ADMIN_DATA: `${BASE_URL}/api/admin/pendaftar`, 
  ADMIN_VERIF: `${BASE_URL}/api/admin/verifikasi`,
  
  // 🔥 FIX DISINI (Pakai Backtick ` bukan Petik ')
  ADMIN_VERIF_KELUARGA: `${BASE_URL}/api/admin/verifikasi-keluarga`, 
  ADMIN_ASSIGN_BUS: `${BASE_URL}/api/admin/assign-bus`,
  ADMIN_KENDARAAN: `${BASE_URL}/api/admin/kendaraan`,
  // ----------------------------------------------

  PETA: `${BASE_URL}/api/peta/sebaran-pemudik`,
  EXPORT: `${BASE_URL}/api/admin/export`,
  TIKET: `${BASE_URL}/api/tiket`,
  RIWAYAT: `${BASE_URL}/api/pendaftaran/riwayat`,
}

/* ================= FETCH WRAPPER ================= */
type Method = "GET" | "POST" | "PUT" | "DELETE"

interface ApiOptions {
  method?: Method
  body?: any
  auth?: boolean
}

async function request<T>(
  url: string,
  { method = "GET", body, auth = true }: ApiOptions = {}
): Promise<T> {
  const token = localStorage.getItem("token")
  const headers: HeadersInit = {}

  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let finalBody = body
  // Deteksi FormData otomatis (biar gak error upload gambar)
  // Kalau BUKAN FormData, kita jadikan JSON string
  if (!(body instanceof FormData) && body) {
    headers["Content-Type"] = "application/json"
    finalBody = JSON.stringify(body)
  }

  const res = await fetch(url, {
    method,
    headers,
    body: finalBody,
  })

  if (!res.ok) {
    // Handle Token Expired / Unauthorized
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/admin/login"; // Redirect ke login admin/user
        throw new Error("Sesi habis, silakan login ulang.");
    }
    
    // Coba baca error dari JSON backend, kalau gagal ambil status text
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || err.message || "Request gagal")
  }

  return res.json()
}

/* ================= ADMIN API HELPER ================= */
export const AdminAPI = {
  login: (payload: { email: string; password: string }) =>
    request<any>(API.LOGIN, {
      method: "POST",
      body: payload,
      auth: false,
    }),

  getPendaftar: () =>
    request<any[]>(API.ADMIN_DATA),

  verifikasi: (id: number, status: string) =>
    request(`${API.ADMIN_VERIF}/${id}`, {
      method: "PUT",
      body: { status },
    }),
}

/* ================= USER API HELPER ================= */
export const UserAPI = {
  daftar: (formData: FormData, ruteId: string) =>
    request(`${API.PENDAFTARAN}?rute_id=${ruteId}`, {
      method: "POST",
      body: formData, 
      auth: true, 
    }),

  riwayat: () =>
    request<any[]>(API.RIWAYAT),
    
  getRute: () =>
    request<any[]>(API.RUTE, { auth: false })
}