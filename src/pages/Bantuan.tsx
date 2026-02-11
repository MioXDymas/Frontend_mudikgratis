import { ArrowLeft, MessageCircle, HelpCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Bantuan() {
    const navigate = useNavigate();

    // Data FAQ
    const faqs = [
        { q: "Bagaimana cara mendaftar?", a: "Login ke aplikasi, pilih menu 'Daftar Mudik', isi formulir sesuai KTP, dan upload foto bukti identitas." },
        { q: "Apakah program ini benar-benar gratis?", a: "Ya, 100% Gratis ditanggung oleh Pemerintah Aceh. Tidak ada pungutan biaya apapun." },
        { q: "Kapan tiket saya keluar?", a: "Setelah Anda mendaftar, Admin akan memverifikasi data dalam 1x24 jam. Jika diterima, tombol download tiket akan muncul di Dashboard." },
        { q: "Bolehkan saya membatalkan pendaftaran?", a: "Bisa. Namun harap informasikan segera agar kuota bisa diberikan ke orang lain. Hubungi Admin via WhatsApp." },
        { q: "Barang apa saja yang boleh dibawa?", a: "Hanya barang kebutuhan pribadi (pakaian) maksimal 1 tas besar dan 1 tas kecil. Dilarang membawa hewan atau benda berbau menyengat." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-2xl mx-auto p-6">
                
                {/* Header Back */}
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition"
                >
                    <ArrowLeft size={20} /> Kembali ke Dashboard
                </button>

                <div className="text-center mb-10">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpCircle size={32} className="text-blue-600"/>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Pusat Bantuan</h1>
                    <p className="text-slate-500">Temukan jawaban atau hubungi panitia langsung.</p>
                </div>

                {/* FAQ List */}
                <div className="space-y-4 mb-12">
                    {faqs.map((item, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group cursor-default">
                            <h3 className="font-bold text-slate-800 flex justify-between items-center">
                                {item.q}
                            </h3>
                            <p className="text-slate-600 mt-3 text-sm leading-relaxed border-t border-slate-100 pt-3">
                                {item.a}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Contact Card */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 rounded-3xl text-center text-white shadow-xl relative overflow-hidden">
                    {/* Dekorasi */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    
                    <h2 className="text-xl font-bold mb-2 relative z-10">Belum menemukan jawaban?</h2>
                    <p className="text-blue-200 mb-6 text-sm relative z-10">Tim kami siap membantu Anda via WhatsApp.</p>
                    
                    <a 
                        href="https://wa.me/6289652892151?text=Halo%20Admin%20Mudik%20Gratis,%20saya%20butuh%20bantuan%20terkait..." 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition transform hover:scale-105 shadow-lg relative z-10"
                    >
                        <MessageCircle size={20}/> Chat WhatsApp Admin
                    </a>
                </div>

                <div className="text-center mt-8 text-xs text-slate-400">
                    &copy; 2026 Dinas Perhubungan Aceh.
                </div>
            </div>
        </div>
    );
}