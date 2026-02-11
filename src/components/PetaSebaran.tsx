import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { API } from "../lib/api"; // Import URL dari api.ts

// 🔥 FIX ICON LEAFLET
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InfoRute {
    kota_asal: string;
    asal_lat: number;
    asal_lon: number;
    kota_tujuan: string;
    tujuan_lat: number;
    tujuan_lon: number;
    jumlah_pemudik: number;
}

export default function PetaSebaran() {
    const [dataPeta, setDataPeta] = useState<InfoRute[]>([]);
    const [jalurRute, setJalurRute] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ambil Data dari Backend pakai URL dari api.ts
        fetch(API.PETA)
            .then(res => res.json())
            .then(async (data: InfoRute[]) => {
                setDataPeta(data);

                const routesPromises = data.map(async (item) => {
                    try {
                        // Tarik garis jalan raya (OSRM)
                        const url = `https://router.project-osrm.org/route/v1/driving/${item.asal_lon},${item.asal_lat};${item.tujuan_lon},${item.tujuan_lat}?overview=full&geometries=geojson`;
                        const resOsrm = await fetch(url);
                        const jsonOsrm = await resOsrm.json();

                        if (jsonOsrm.routes && jsonOsrm.routes.length > 0) {
                            const coords = jsonOsrm.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                            return { color: '#2563eb', positions: coords, info: `${item.kota_asal} ➝ ${item.kota_tujuan}` };
                        }
                    } catch (e) {
                        // Fallback garis lurus
                        return { color: 'red', positions: [[item.asal_lat, item.asal_lon], [item.tujuan_lat, item.tujuan_lon]], info: 'Jalur Lurus' };
                    }
                    return null;
                });

                const hasilJalur = await Promise.all(routesPromises);
                setJalurRute(hasilJalur.filter(j => j !== null));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="h-[300px] flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl animate-pulse">Memuat Data Peta...</div>;

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm z-0 relative">
            <MapContainer center={[4.6951, 96.7494]} zoom={7} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />

                {dataPeta.map((item, idx) => (
                    <React.Fragment key={idx}>
                        <CircleMarker center={[item.asal_lat, item.asal_lon]} pathOptions={{ color: 'green', fillColor: '#0f0', fillOpacity: 0.8 }} radius={6}>
                            <Popup>Start: {item.kota_asal}</Popup>
                        </CircleMarker>
                        <Marker position={[item.tujuan_lat, item.tujuan_lon]}>
                            <Popup>
                                <div className="text-center">
                                    <b>{item.kota_tujuan}</b><br/>
                                    <span className="text-blue-600 font-bold">{item.jumlah_pemudik} Pemudik</span>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                ))}

                {jalurRute.map((jalur, idx) => (
                    <Polyline key={idx} positions={jalur.positions} pathOptions={{ color: jalur.color, weight: 3, opacity: 0.7 }} />
                ))}
            </MapContainer>
        </div>
    );
}