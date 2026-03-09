import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Starfield from "@/components/Starfield";
import PageNavigation from "@/components/PageNavigation";
import { Trophy, ArrowLeft } from "lucide-react";
import { playPopSound } from "@/hooks/useAudio";

const olimpiadeTopics = [
  "Bilangan Bulat",
  "Bilangan Rasional",
  "Bilangan Berpangkat",
  "Bilangan Irasional",
  "KPK dan FPB",
  "Modulo - Sisa Pembagian",
  "Himpunan",
  "Relasi dan Fungsi",
  "Perbandingan",
  "Aljabar",
  "Persamaan dan Pertidaksamaan Linear Satu Variabel",
  "Persamaan Garis",
  "Persamaan Kuadrat",
  "Fungsi Kuadrat",
  "Aritmetika Sosial",
  "Pola Bilangan",
  "Sistem Persamaan Linear Dua Variabel",
  "Garis dan Sudut",
  "Koordinat Cartesius",
  "Teorema Pythagoras",
  "Segitiga dan Segiempat (Bangun Datar)",
  "Lingkaran",
  "Bangun Ruang Sisi Datar",
  "Bangun Ruang Sisi Lengkung",
  "Kesebangunan dan Kekongruenan",
  "Transformasi Geometri",
  "Statistika",
  "Peluang",
];

const OlimpiadePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center gradient-space overflow-hidden">
      <Starfield />
      <PageNavigation />
      <div className="relative z-10 max-w-3xl w-full px-4 py-10">
        <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary text-glow-cyan mb-2 text-center">
          OLIMPIADE MATEMATIKA
        </h1>
        <p className="text-white/60 text-sm text-center mb-8 font-body">
          Untuk yang suka tantangan 🏆
        </p>

        <div className="flex flex-col gap-3 animate-slide-up">
          {olimpiadeTopics.map((topik, i) => {
            const hasContent = topik === "Bilangan Bulat" || topik === "Bilangan Rasional";
            return (
              <button
                key={topik}
                onClick={() => {
                  playPopSound();
                  if (topik === "Bilangan Bulat") {
                    navigate("/olimpiade/bilangan-bulat");
                  } else if (topik === "Bilangan Rasional") {
                    navigate("/olimpiade/bilangan-rasional");
                  }
                }}
                className="group flex items-center gap-4 bg-card/80 backdrop-blur border border-border rounded-xl px-5 py-4
                  hover:border-accent/60 transition-all duration-300
                  cursor-pointer text-left animate-slide-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <Trophy className="w-5 h-5 text-accent shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-body text-sm text-white">{topik}</span>
                {hasContent && (
                  <span className="ml-auto text-xs text-accent font-display">BUKA</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => { playPopSound(); navigate("/menu"); }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-body"
          >
            ← Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default OlimpiadePage;
