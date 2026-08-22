import TKAPemantapanLayout from "@/components/tka/TKAPemantapanLayout";
import type { MateriSection, LatihanSoal } from "@/components/tka/TKAPemantapanLayout";
import { getTkaContohSoal } from "@/data/tkaContohSoal";
import { latihanDasar as latihanDasarOlimpiade, dasarImages } from "@/pages/OlimpiadeBangunRuangSisiDatarPage";
import { bangunRuangSisiDatarDasarPembahasan } from "@/data/pembahasan/bangunRuangSisiDatarDasar";

const materiSections: MateriSection[] = [
  { heading: "A. Kubus", content: `Kubus: bangun ruang berisi 6 sisi berbentuk persegi, 12 rusuk sama panjang, 8 titik sudut.\n\nJika rusuk = s:\n- Luas permukaan = $6s^2$\n- Volume = $s^3$\n- Diagonal ruang = $s\\sqrt{3}$\n- Diagonal sisi = $s\\sqrt{2}$` },
  { heading: "B. Balok", content: `Balok: bangun ruang dengan 6 sisi berbentuk persegi panjang (tiga pasang), 12 rusuk, 8 titik sudut.\n\nJika panjang = p, lebar = l, tinggi = t:\n- Luas permukaan = $2(pl + pt + lt)$\n- Volume = $p \\times l \\times t$\n- Diagonal ruang = $\\sqrt{p^2 + l^2 + t^2}$` },
  { heading: "C. Prisma", content: `Prisma: bangun ruang dengan dua sisi alas yang sama dan sejajar, sisi tegak berbentuk persegi panjang.\n\n- Luas permukaan = $2 \\times L_{alas} + K_{alas} \\times t$\n- Volume = $L_{alas} \\times t$\n\n(L = luas, K = keliling, t = tinggi prisma)` },
  { heading: "D. Limas", content: `Limas: bangun ruang dengan satu sisi alas dan sisi tegak berbentuk segitiga bertemu di satu titik (puncak).\n\n- Luas permukaan = $L_{alas} + \\sum L_{sisi\\ tegak}$\n- Volume = $\\frac{1}{3} \\times L_{alas} \\times t$\n\nUntuk limas segi empat beraturan:\n- Tinggi sisi tegak: apotema\n- Luas sisi tegak = $\\frac{1}{2} \\times alas \\times apotema$` },
];

const BangunRuangSisiDatarPage = () => (
  <TKAPemantapanLayout
    title="BANGUN RUANG SISI DATAR"
    materiSections={materiSections}
    contohSoal={getTkaContohSoal("bangun-ruang-sisi-datar")}
    latihanDasar={latihanDasarOlimpiade.filter((soal) => ![2, 3, 4, 7, 10, 18, 23, 25, 26, 31, 32, 37, 38, 41, 42, 46].includes(soal.no)).map((soal, index) => ({ ...soal, no: index + 1, pembahasan: bangunRuangSisiDatarDasarPembahasan[soal.no]?.konsepTrik ?? "" }))}
    gambarMap={Object.fromEntries(Object.entries(dasarImages).map(([no, src]) => [Number(no), <img src={src} alt={`Gambar soal ${no}`} className="mx-auto w-full max-w-sm rounded-lg border border-border/40 bg-background p-2" />]))}
  />
);

export default BangunRuangSisiDatarPage;
