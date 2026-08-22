import { useState, useMemo } from "react";
import Starfield from "@/components/Starfield";
import PageNavigation from "@/components/PageNavigation";
import { Hash, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { playPopSound } from "@/hooks/useAudio";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const MathText = ({ text, className = "" }: { text: string; className?: string }) => {
  const elements = useMemo(() => {
    const result: React.ReactNode[] = [];
    let key = 0;
    const blockParts = text.split(/(\$\$[^$]+\$\$)/g);
    blockParts.forEach((part) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2).trim();
        result.push(<span key={key++} className="mx-1 block text-center my-2"><BlockMath math={math} /></span>);
      } else if (part) {
        const inlineParts = part.split(/(\$[^$]+\$)/g);
        inlineParts.forEach((ip) => {
          if (ip.startsWith("$") && ip.endsWith("$")) {
            result.push(<span key={key++} className="mx-0.5"><InlineMath math={ip.slice(1, -1)} /></span>);
          } else if (ip) {
            result.push(<span key={key++}>{ip}</span>);
          }
        });
      }
    });
    return result;
  }, [text]);
  return <span className={className}>{elements}</span>;
};

type Difficulty = "Mudah" | "Sedang" | "Sulit";
type QuestionType = "PG" | "MCMA" | "Benar/Salah";

interface Statement { text: string; isCorrect: boolean; }
interface TableData { headers: string[]; rows: string[][]; }
interface Question {
  id: number;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  question: string;
  options?: string[];
  statements?: Statement[];
  correctAnswer?: string;
  table?: TableData;
  svgKey?: string;
  explanation: { concept: string; steps: string[]; formula?: string; };
}

/* ── SVG Visual Components ── */
const SequenceSVG = ({ terms, label }: { terms: (string | number)[]; label: string }) => (
  <svg viewBox="0 0 300 80" className="w-full max-w-sm mx-auto my-3 rounded-lg bg-slate-800/60 border border-slate-600 p-2">
    <text x="150" y="16" fill="#fbbf24" fontSize="8" textAnchor="middle" fontFamily="monospace">{label}</text>
    {terms.map((t, i) => (
      <g key={i}>
        <circle cx={20 + i * 52} cy="45" r="18" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth="1.5" />
        <text x={20 + i * 52} y="49" fill="var(--icon-color)" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{t}</text>
        {i < terms.length - 1 && <text x={20 + i * 52 + 30} y="49" fill="#64748b" fontSize="14" textAnchor="middle" fontFamily="monospace">→</text>}
      </g>
    ))}
    <text x="150" y="75" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">U₁  U₂  U₃  U₄  U₅</text>
  </svg>
);

const ArithSVG = ({ a, b, terms }: { a: number; b: number; terms: number[] }) => (
  <svg viewBox="0 0 300 100" className="w-full max-w-sm mx-auto my-3 rounded-lg bg-slate-800/60 border border-slate-600 p-2">
    <text x="150" y="14" fill="#fbbf24" fontSize="8" textAnchor="middle" fontFamily="monospace">Barisan Aritmetika: a={a}, b={b}</text>
    {terms.map((t, i) => (
      <g key={i}>
        <rect x={10 + i * 56} y="22" width="42" height="28" rx="4" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth="1.5" />
        <text x={31 + i * 56} y="40" fill="var(--icon-color)" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{t}</text>
        {i < terms.length - 1 && (
          <>
            <line x1={52 + i * 56} y1="36" x2={58 + i * 56} y2="36" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr2)" />
            <text x={55 + i * 56} y="30" fill="#22c55e" fontSize="7" textAnchor="middle" fontFamily="monospace">+{b}</text>
          </>
        )}
      </g>
    ))}
    <text x="150" y="75" fill="#94a3b8" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Uₙ = a + (n−1)b = {a} + (n−1)·{b}</text>
    <text x="150" y="88" fill="#a78bfa" fontSize="7.5" textAnchor="middle" fontFamily="monospace">a = suku pertama, b = beda</text>
  </svg>
);

const GeomSVG = ({ a, r, terms }: { a: number; r: number; terms: number[] }) => (
  <svg viewBox="0 0 300 100" className="w-full max-w-sm mx-auto my-3 rounded-lg bg-slate-800/60 border border-slate-600 p-2">
    <text x="150" y="14" fill="#fbbf24" fontSize="8" textAnchor="middle" fontFamily="monospace">Barisan Geometri: a={a}, r={r}</text>
    {terms.map((t, i) => (
      <g key={i}>
        <rect x={10 + i * 56} y="22" width="42" height="28" rx="4" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5" />
        <text x={31 + i * 56} y="40" fill="var(--icon-color)" fontSize="11} " textAnchor="middle" fontFamily="monospace" fontWeight="bold">{t}</text>
        {i < terms.length - 1 && (
          <>
            <line x1={52 + i * 56} y1="36" x2={58 + i * 56} y2="36" stroke="#f97316" strokeWidth="1.5" />
            <text x={55 + i * 56} y="30" fill="#f97316" fontSize="7" textAnchor="middle" fontFamily="monospace">×{r}</text>
          </>
        )}
      </g>
    ))}
    <text x="150" y="75" fill="#94a3b8" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Uₙ = a × rⁿ⁻¹ = {a} × {r}ⁿ⁻¹</text>
    <text x="150" y="88" fill="#a78bfa" fontSize="7.5" textAnchor="middle" fontFamily="monospace">a = suku pertama, r = rasio</text>
  </svg>
);

const TriangleSVG = () => (
  <svg viewBox="0 0 280 110" className="w-full max-w-sm mx-auto my-3 rounded-lg bg-slate-800/60 border border-slate-600 p-2">
    <text x="140" y="14" fill="#fbbf24" fontSize="8" textAnchor="middle" fontFamily="monospace">Pola Bilangan Segitiga: 1, 3, 6, 10, 15...</text>
    {[1,3,6,10,15].map((v, i) => (
      <g key={i}>
        <circle cx={20 + i * 52} cy="55" r="19" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.5" />
        <text x={20 + i * 52} y="59" fill="var(--icon-color)" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{v}</text>
        <text x={20 + i * 52} y="88" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">n={i+1}</text>
        {i < 4 && <text x={20 + i * 52 + 28} y="59" fill="#64748b" fontSize="12" textAnchor="middle">→</text>}
      </g>
    ))}
    <text x="140" y="104" fill="#4ade80" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Uₙ = n(n+1)/2</text>
  </svg>
);

const FibonacciSVG = () => (
  <svg viewBox="0 0 300 80" className="w-full max-w-sm mx-auto my-3 rounded-lg bg-slate-800/60 border border-slate-600 p-2">
    <text x="150" y="14" fill="#fbbf24" fontSize="8" textAnchor="middle" fontFamily="monospace">Barisan Fibonacci: 1, 1, 2, 3, 5, 8...</text>
    {[1,1,2,3,5,8].map((v, i) => (
      <g key={i}>
        <circle cx={14 + i * 46} cy="44" r="16" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="1.5" />
        <text x={14 + i * 46} y="48" fill="var(--icon-color)" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{v}</text>
        {i < 5 && <text x={14 + i * 46 + 26} y="48" fill="#64748b" fontSize="11" textAnchor="middle">→</text>}
      </g>
    ))}
    <text x="150" y="70" fill="#fde68a" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Uₙ = Uₙ₋₁ + Uₙ₋₂ (jumlah dua suku sebelumnya)</text>
  </svg>
);

const TableVisual = ({ table }: { table: TableData }) => (
  <div className="overflow-x-auto my-3">
    <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
      <thead>
        <tr>{table.headers.map((h, i) => (
          <th key={i} className="bg-primary/20 border border-primary/30 px-3 py-2 text-primary font-bold text-center font-mono">
            <MathText text={h} />
          </th>
        ))}</tr>
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-slate-800/40" : "bg-slate-700/30"}>
            {row.map((cell, j) => (
              <td key={j} className="border border-slate-600/40 px-3 py-2 text-center text-white/80 font-body">
                <MathText text={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const visualMap: Record<string, React.ReactNode> = {
  "seq-2-4-6-8": <SequenceSVG terms={[2,4,6,8,"..."]} label="Pola Bilangan Genap" />,
  "seq-1-3-5-7": <SequenceSVG terms={[1,3,5,7,"..."]} label="Pola Bilangan Ganjil" />,
  "seq-1-4-9-16": <SequenceSVG terms={[1,4,9,16,"..."]} label="Pola Bilangan Persegi" />,
  "seq-3-6-9-12": <SequenceSVG terms={[3,6,9,12,"..."]} label="Kelipatan 3" />,
  "seq-2-6-18-54": <SequenceSVG terms={[2,6,18,54,"..."]} label="Barisan Geometri r=3" />,
  "arith-2-3": <ArithSVG a={2} b={3} terms={[2,5,8,11,14]} />,
  "arith-5-4": <ArithSVG a={5} b={4} terms={[5,9,13,17,21]} />,
  "arith-3-2": <ArithSVG a={3} b={2} terms={[3,5,7,9,11]} />,
  "arith-1-5": <ArithSVG a={1} b={5} terms={[1,6,11,16,21]} />,
  "arith-10-neg3": <ArithSVG a={10} b={-3} terms={[10,7,4,1,-2]} />,
  "geom-2-3": <GeomSVG a={2} r={3} terms={[2,6,18,54,162]} />,
  "geom-3-2": <GeomSVG a={3} r={2} terms={[3,6,12,24,48]} />,
  "geom-1-2": <GeomSVG a={1} r={2} terms={[1,2,4,8,16]} />,
  "geom-4-3": <GeomSVG a={4} r={3} terms={[4,12,36,108,324]} />,
  "triangle": <TriangleSVG />,
  "fibonacci": <FibonacciSVG />,
};

const soalPolaBilangan: Question[] = [
  { id: 1, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Diketahui barisan bilangan aritmetika sebagai berikut.\n$-8, -4, 0, 4, 8, 12, n, 20, 24$\nNilai n yang memenuhi adalah ....", options: ["A. 10", "B. 14", "C. 16", "D. 18"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 2, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Tiga suku berikutnya dari 1, 3, 5, 8, 9, 13, …, …., … adalah ....", options: ["A. 13, 18, 17", "B. 13, 17, 18", "C. 14, 17, 18", "D. 14, 18, 18"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 3, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Suku ke-22 dari barisan 99, 93, 87, 81, … adalah ....", options: ["A. –27", "B. –21", "C. –15", "D. –9"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 4, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Suku pertama dari barisan aritmatika adalah 3 dan bedanya 4, suku ke-10 dari barisan aritmatika tersebut adalah ....", options: ["A. 30", "B. 33", "C. 36", "D. 39"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 5, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Dari barisan aritmetika diketahui $U_3 = 18$ dan $U_7 = 38$. Jumlah 24 suku pertama adalah ....", options: ["A. 786", "B. 1248", "C. 1572", "D. 3144"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 6, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Dalam gedung pertunjukkan disusun kursi dengan baris paling depan terdiri dari 12 buah, baris kedua berisi 14 buah, baris ketiga 16 buah dan seterusnya selalu bertambah 2. Banyaknya kursi pada baris ke-20 adalah ....", options: ["A. 28 buah", "B. 50 buah", "C. 58 buah", "D. 60 buah"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 7, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Pada tumpukan batu bata, banyak batu bata paling atas ada 8 buah, tepat di bawahnya ada 10 buah, dan seterusnya setiap tumpukan di bawahnya selalu lebih banyak 2 buah dari tumpukan di atasnya. Jika ada 15 tumpukan batu bata (dari atas sampai bawah), berapa banyak batu bata pada tumpukan paling bawah?", options: ["A. 35 buah", "B. 36 buah", "C. 38 buah", "D. 40 buah"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 8, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Dalam suatu ruang terdapat 15 baris kursi, baris paling depan terdapat 23 kursi, baris berikutnya 2 kursi lebih banyak dari baris di depannya. Jumlah kursi dalam ruang tersebut adalah ....", options: ["A. 555", "B. 385", "C. 1.110", "D. 1.140"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 9, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Permintaan suatu produk barang diperkirakan mengalami kenaikan 5.000 unit setiap bulan. Jika jumlah produk pertamanya 100.000, maka jumlah produk selama satu tahun pertama adalah ....", options: ["A. 1.205.000 unit", "B. 1.255.000 unit", "C. 1.260.000 unit", "D. 1.530.000 unit", "E. 1.560.000 unit"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 10, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Diketahui barisan aritmatika, suku ke-7 dan suku ke-4 adalah 26 dan 14. Jika $U_n$ menyatakan suku ke-n dan $S_n$ menyatakan jumlah sampai n suku pertama, pernyataan yang benar adalah ....", options: ["A. $U_{30} = 108$", "B. $U_{35} = 158$", "C. $S_{15} = 450$", "D. $S_{20} = 1.600$"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 11, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Tentukan jumlah semua bilangan asli antara 200 dan 400 yang habis dibagi 4 dan habis dibagi 6.", options: ["A. 3.000", "B. 3.200", "C. 3.600", "D. 3.800"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 12, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Berapakah jumlah semua bilangan bulat dari 100 sampai 500 yang habis dibagi 8 dan habis dibagi 12?", options: ["A. 3.000", "B. 3.120", "C. 3.360", "D. 3.600"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 13, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Tentukan jumlah semua bilangan asli antara 100 dan 300 yang habis dibagi 7 tetapi tidak habis dibagi 5.", options: ["A. 3.424", "B. 3.696", "C. 4.060", "D. 4.200"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 14, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Diberikan deret bilangan bulat positif: 1, 2, 3, …, 200. Tentukan jumlah bilangan dalam deret tersebut yang habis dibagi 4 tetapi tidak habis dibagi 10.", options: ["A. 4.000", "B. 4.200", "C. 4.400", "D. 4.800"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 15, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Diketahui barisan bilangan 8, 4, 2, 1, …. Rumus suku ke-n barisan tersebut adalah ....", options: ["A. $2^{n+2}$", "B. $2^{n-4}$", "C. $2^{-n+4}$", "D. $2^{n-1}$"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 16, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Suku pertama dan kelima suatu barisan geometri berturut-turut 5 dan 80. Suku ke-9 barisan geometri tersebut adalah ....", options: ["A. 90", "B. 405", "C. 940", "D. 1.280"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 17, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Suku ke-2 dan ke-4 barisan geometri adalah 384 dan 96. Suku ke-8 barisan tersebut adalah ....", options: ["A. 3", "B. 6", "C. 9", "D. 12"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 18, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Suku ke-1 dan suku ke-4 barisan geometri adalah 5 dan 40. Jumlah 6 suku pertama dari barisan tersebut adalah ....", options: ["A. 155", "B. 160", "C. 315", "D. 320"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 19, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Celin melipat-lipat kertas berkali-kali. Jika ketebalan kertas mula-mula 2 mm, maka butuh berapa kali lipatan sehingga ketebalan kertas menjadi 256 mm?", options: ["A. 7 kali", "B. 8 kali", "C. 9 kali", "D. 10 kali"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 20, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Seutas tali dibagi menjadi enam bagian, sehingga bagian-bagiannya membentuk barisan geometri. Jika panjang tali terpendek 9 cm dan panjang tali terpanjang 288 cm, maka panjang tali mula-mula adalah ....", options: ["A. 567 cm", "B. 576 cm", "C. 586 cm", "D. 596 cm"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 21, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Setiap bakteri akan membelah diri menjadi 2 setiap 15 menit. Jika banyak bakteri pada pukul 10.00 ada 25 buah, maka banyak bakteri pada pukul 12.15 adalah ....", options: ["A. 800", "B. 1600", "C. 3200", "D. 6400"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 22, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Suku ke-14 barisan 15, 24, 35, 48, 63, … adalah ....", options: ["A. 185", "B. 194", "C. 288", "D. 312"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 23, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Suku ke-40 dari 3, 5, 9, 15, 23, … adalah ....", options: ["A. 1560", "B. 1563", "C. 1600", "D. 1603"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 24, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Tiga suku berikutnya dari 1, 3, 6, 7, 11, 11, … adalah ....", options: ["A. 13, 18, 17", "B. 13, 17, 18", "C. 16, 15, 21", "D. 16, 15, 20"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 25, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Rumus suku ke-n barisan adalah $U_n = 2n(n-1)$. Hasil dari $U_9 - U_7$ adalah ....", options: ["A. 80", "B. 70", "C. 60", "D. 50"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 26, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Rumus suku ke-n dari barisan bilangan 0, 4, 10, 18, … adalah ....", options: ["A. $\\frac{1}{2}n(n+1)$", "B. $2n(n+1)$", "C. $(n-1)(n+2)$", "D. $(n+1)(n+2)$"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 27, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Perhatikan gambar berikut!\nBanyak persegi satuan pada pola ke-19 adalah ....", options: ["A. 36", "B. 38", "C. 40", "D. 42"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 28, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Perhatikan gambar pola berikut.\nBanyak lingkaran pada pola ke-15 adalah ....", options: ["A. 105", "B. 120", "C. 210", "D. 240"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 29, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Gambar berikut adalah pola segitiga.\nBanyak segitiga satu-satuan pada pola ke-7 adalah ....", options: ["A. 28", "B. 36", "C. 42", "D. 49"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 30, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Perhatikan gambar pola berikut!\nBanyak lingkaran pada pola ke-10 adalah ....", options: ["A. 99 buah", "B. 104 buah", "C. 115 buah", "D. 120 buah"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 31, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "Perhatikanlah pola berikut.\nBanyak lingkaran pada pola ke-30 adalah ....", options: ["A. 39", "B. 41", "C. 57", "D. 59"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 26, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "OSN Matematika 2019 Tingkat Kota\nBilangan tadutima adalah bilangan bulat positif yang bukan kelipatan 2, 3, atau 5. Banyak bilangan bulat positif kurang dari 1001 yang merupakan bilangan tadutima adalah ...", options: ["A. 333", "B. 266", "C. 233", "D. 167"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 27, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "OSN Matematika 2019 Tingkat Kota\nDiketahui 20 suku pertama suatu barisan aritmetika adalah 1390. Jika suku pertama dari barisan tersebut adalah 3, selisih dari dua suku berurutan di barisan tersebut adalah ...", options: ["A. 7", "B. 17", "C. 21", "D. 24"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 28, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "OSN Matematika 2020 Tingkat Kota\nJumlah n suku pertama suatu deret aritmetika adalah 450. Jika suku pertama adalah n dan suku ke-n adalah 3, maka selisih barisan tersebut adalah ...", options: ["A. $\\frac{13}{7}$", "B. $\\frac{15}{7}$", "C. $\\frac{13}{11}$", "D. $\\frac{15}{11}$"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 29, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "OSN Matematika 2020 Tingkat Kota\nPerhatikan barisan bilangan berikut.\n1, 2, 4, 8, 15, 26, ?, ?, ?, ...\nTiga bilangan selanjutnya berturut-turut adalah ...", options: ["A. 37, 49, 71", "B. 37, 61, 99", "C. 42, 58, 74", "D. 42, 64, 93"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 30, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "OSN Matematika 2021 Tingkat Kota\nMisalkan B menyatakan barisan bilangan bulat yang suku-sukunya $b_1, b_2, b_3, b_4, ...$ dan f(B) menyatakan barisan bilangan bulat yang suku-sukunya $b_1 - b_2, b_2 - b_3, b_3 - b_4, ...$ Jika semua suku dari barisan f(f(B)) adalah bilangan bulat c, dengan c = 3, dan diketahui $b_{21} \\times b_{42} = b_{21} + b_{42} = 0$, maka nilai dari $b_2$ adalah ...", options: ["A. 90", "B. 760", "C. 1140", "D. 1230"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
  { id: 31, type: "PG", difficulty: "Sedang", category: "Pola Bilangan", question: "OSN Matematika 2022 Tingkat Kota\nDiketahui suatu barisan aritmetika $a_1, a_2, a_3, ...$ dengan semua sukunya bilangan bulat, $a_1$ habis dibagi 3, $a_2$ habis dibagi 5 dan $a_3$ habis dibagi 7. Jika $a_1 + a_2 + a_3 = 405$ dan $a_1 > 105$, maka nilai k terkecil sedemikian $a_k > 1000$ adalah ...", options: ["A. 74", "B. 75", "C. 76", "D. 77"], correctAnswer: "", explanation: { concept: "Pola bilangan", steps: ["Gunakan pola bilangan yang diberikan."] } },
];

/* ── UI Components ── */
const difficultyColor: Record<Difficulty, string> = {
  "Mudah": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Sedang": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Sulit": "bg-rose-500/20 text-rose-400 border-rose-500/30"
};
const typeColor: Record<QuestionType, string> = {
  "PG": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "MCMA": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Benar/Salah": "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30"
};
const typeLabel: Record<QuestionType, string> = {
  "PG": "Pilihan Ganda",
  "MCMA": "PG Kompleks MCMA",
  "Benar/Salah": "PG Kompleks B/S"
};

const SoalCard = ({ soal }: { soal: Question }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMCMA = soal.type === "MCMA";
  const isBS = soal.type === "Benar/Salah";
  return (
    <div className="group relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-500 animate-slide-up"
      style={{ background: "linear-gradient(135deg,rgba(30,41,59,0.6) 0%,rgba(15,23,42,0.8) 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.05)" }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%,rgba(0,200,255,0.08) 0%,transparent 50%)" }} />
      <div className="relative p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-bold text-primary/80 bg-primary/10 px-2 py-1 rounded-md">#{soal.id}</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${difficultyColor[soal.difficulty]}`}>{soal.difficulty}</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${typeColor[soal.type]}`}>{typeLabel[soal.type]}</span>
          <span className="text-xs text-white/30 font-body">{soal.category}</span>
        </div>
        <div className="mb-4">
          <div className="text-foreground font-body text-sm md:text-base leading-relaxed whitespace-pre-line">
            <MathText text={soal.question} />
          </div>
          {soal.svgKey && visualMap[soal.svgKey] && <div className="mt-3">{visualMap[soal.svgKey]}</div>}
          {soal.table && <TableVisual table={soal.table} />}
        </div>
        {soal.options && (
          <div className="space-y-2 mb-4">
            {soal.options.map((opt, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200">
                <span className="text-sm text-foreground/90 font-body"><MathText text={opt} /></span>
              </div>
            ))}
          </div>
        )}
        {soal.statements && (
          <div className="space-y-2 mb-4">
            {soal.statements.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${isMCMA ? "bg-muted/30 border-border/30" : "bg-muted/20 border-border/20"}`}>
                <span className={`text-xs font-bold shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${isMCMA ? "bg-violet-500/20 text-violet-300" : "bg-fuchsia-500/20 text-fuchsia-300"}`}>
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/90 font-body"><MathText text={s.text} /></span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => { playPopSound(); setIsOpen(!isOpen); }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 hover:from-primary/30 hover:to-secondary/30 hover:border-primary/50 transition-all duration-300 cursor-pointer">
          <span className="text-sm font-semibold text-primary">{isOpen ? "Sembunyikan Pembahasan" : "Lihat Pembahasan"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[2000px] opacity-100 mt-5" : "max-h-0 opacity-0"}`}>
          <div className="relative p-5 rounded-xl border border-primary/20"
            style={{ background: "linear-gradient(135deg,rgba(0,200,255,0.05) 0%,rgba(139,92,246,0.05) 100%)" }}>
            {/* ─── Jawaban ─── */}
            <div className="px-4 py-3 rounded-xl border-2 border-emerald-400/60 bg-emerald-950/40 shadow-lg shadow-emerald-900/20 mb-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1.5">Jawaban</div>
              {soal.correctAnswer && (
                <div className="font-body text-sm text-emerald-50 font-bold">
                  <MathText text={Array.isArray(soal.correctAnswer) ? soal.correctAnswer.join(", ") : soal.correctAnswer} />
                </div>
              )}
              {soal.statements && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {soal.statements.map((s, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded font-body font-semibold ${s.isCorrect ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-300"}`}>
                      ({i+1}) {s.isCorrect ? "✓ Benar" : "✗ Salah"}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* ─── Konsep & Trik ─── */}
            <div className="px-4 py-3 rounded-xl border-2 border-violet-400/55 shadow-lg shadow-violet-900/20 mb-2.5" style={{background:"linear-gradient(135deg,rgba(139,92,246,0.16) 0%,rgba(124,58,237,0.10) 100%)"}}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300 mb-1.5">Konsep &amp; Trik</div>
              <div className="font-body text-xs text-violet-50/90 leading-relaxed">
                <MathText text={soal.explanation.concept} />
              </div>
            </div>
            {/* ─── Step by Step ─── */}
            <div className="px-4 py-3 rounded-xl border-2 border-cyan-400/55 shadow-lg shadow-cyan-900/20 mb-2.5" style={{background:"linear-gradient(135deg,rgba(34,211,238,0.12) 0%,rgba(59,130,246,0.10) 100%)"}}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-1.5">Step by Step Penyelesaian</div>
              <div className="space-y-1.5">
                {soal.explanation.steps.map((step, si) => (
                  <div key={si} className="flex gap-2 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center mt-0.5">{si + 1}</span>
                    <p className="text-xs text-cyan-50/90 font-body leading-relaxed"><MathText text={step} /></p>
                  </div>
                ))}
              </div>
            </div>
            {/* ─── Tips ─── */}
            <div className="px-4 py-3 rounded-xl border-2 border-amber-400/55 shadow-lg shadow-amber-900/20 mb-2.5" style={{background:"linear-gradient(135deg,rgba(251,191,36,0.14) 0%,rgba(245,158,11,0.10) 100%)"}}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1.5">Tips</div>
              <div className="font-body text-xs text-amber-50/90 leading-relaxed">
                {soal.explanation.formula ? <MathText text={soal.explanation.formula} /> : "Kuasai konsep utama dan latih langkah penyelesaian secara berurutan. Verifikasi jawaban dengan substitusi kembali ke soal."}
              </div>
            </div>
            {/* ─── Kesimpulan ─── */}
            <div className="px-4 py-3 rounded-xl border-2 border-rose-400/55 shadow-lg shadow-rose-900/20" style={{background:"linear-gradient(135deg,rgba(244,63,94,0.14) 0%,rgba(236,72,153,0.10) 100%)"}}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-rose-300 mb-1.5">Kesimpulan</div>
              <div className="font-body text-xs text-rose-50/90 leading-relaxed font-medium">
                Jadi, jawaban yang tepat adalah{" "}
                <span className="font-bold text-rose-200">
                  {soal.correctAnswer ? <MathText text={Array.isArray(soal.correctAnswer) ? soal.correctAnswer.join(", ") : soal.correctAnswer} /> : "lihat kunci jawaban di atas"}
                </span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const BankSoalPolaBilanganPage = () => {
  const navigate = useNavigate();
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "Semua">("Semua");
  const [filterType, setFilterType] = useState<QuestionType | "Semua">("Semua");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = soalPolaBilangan.filter(s =>
    (filterDifficulty === "Semua" || s.difficulty === filterDifficulty) &&
    (filterType === "Semua" || s.type === filterType)
  );

  const counts = {
    Mudah: soalPolaBilangan.filter(s => s.difficulty === "Mudah").length,
    Sedang: soalPolaBilangan.filter(s => s.difficulty === "Sedang").length,
    Sulit: soalPolaBilangan.filter(s => s.difficulty === "Sulit").length,
    PG: soalPolaBilangan.filter(s => s.type === "PG").length,
    MCMA: soalPolaBilangan.filter(s => s.type === "MCMA").length,
    BS: soalPolaBilangan.filter(s => s.type === "Benar/Salah").length,
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center gradient-space overflow-x-hidden">
      <Starfield />
      <PageNavigation prevPath="/bank-soal" />
      <div className="relative z-10 max-w-4xl w-full px-4 pt-20 pb-12">
        <Hash className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-xl md:text-2xl font-bold text-primary text-glow-cyan mb-1 text-center">
          BANK SOAL POLA BILANGAN
        </h1>
        <p className="text-white/60 text-sm text-center mb-1 font-body">
          Barisan Aritmetika · Barisan Geometri · Deret · Pola Konfigurasi Objek
        </p>
        <p className="text-white/40 text-xs text-center mb-5 font-body">
          100 Soal · UN / TKA / HOTS / ANBK · PG + MCMA + Benar/Salah · Dengan Pembahasan
        </p>

        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-body">{counts.Mudah} Mudah</span>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-body">{counts.Sedang} Sedang</span>
          <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-body">{counts.Sulit} Sulit</span>
        </div>
        <div className="flex justify-center gap-2 mb-5 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-body">{counts.PG} PG</span>
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-body">{counts.MCMA} MCMA</span>
          <span className="text-xs px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 font-body">{counts.BS} B/S</span>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-body">Total: {soalPolaBilangan.length} Soal</span>
        </div>

        <div className="mb-6">
          <button onClick={() => { playPopSound(); setShowFilter(v => !v); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/60 border border-border hover:border-primary/40 transition-all text-sm text-white/70 cursor-pointer font-body mx-auto">
            <Filter className="w-4 h-4" /> Filter Soal {showFilter ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
          </button>
          {showFilter && (
            <div className="mt-3 p-4 rounded-xl bg-card/60 border border-border space-y-3">
              <div>
                <p className="text-xs text-white/50 mb-2 font-body">Tingkat Kesulitan:</p>
                <div className="flex flex-wrap gap-2">
                  {(["Semua","Mudah","Sedang","Sulit"] as const).map(d => (
                    <button key={d} onClick={() => { playPopSound(); setFilterDifficulty(d); }}
                      className={`text-xs px-3 py-1.5 rounded-full border font-body cursor-pointer transition-all ${filterDifficulty === d ? "bg-primary text-white border-primary" : "border-border text-white/50 hover:border-primary/40"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-2 font-body">Tipe Soal:</p>
                <div className="flex flex-wrap gap-2">
                  {(["Semua","PG","MCMA","Benar/Salah"] as const).map(t => (
                    <button key={t} onClick={() => { playPopSound(); setFilterType(t); }}
                      className={`text-xs px-3 py-1.5 rounded-full border font-body cursor-pointer transition-all ${filterType === t ? "bg-primary text-white border-primary" : "border-border text-white/50 hover:border-primary/40"}`}>
                      {t === "MCMA" ? "PG Kompleks MCMA" : t === "Benar/Salah" ? "PG Kompleks B/S" : t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/40 font-body">Menampilkan {filtered.length} dari {soalPolaBilangan.length} soal</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {filtered.map(soal => <SoalCard key={soal.id} soal={soal} />)}
        </div>

        <div className="mt-10 text-center">
          <button onClick={() => { playPopSound(); navigate("/bank-soal"); }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-body">
            ← Kembali ke Bank Soal
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankSoalPolaBilanganPage;
