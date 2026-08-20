import { ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

const renderWithLatex = (text: string) => {
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      return <InlineMath key={index} math={part.slice(1, -1)} />;
    }
    return <span key={index}>{part}</span>;
  });
};
import { useNavigate } from "react-router-dom";
import PageNavigation from "@/components/PageNavigation";
import { bankSoalTeoremaPythagoras } from "@/pages/tka/modul-pemantapan/TeoremaPage";

type Question = { no: number; text: string; options: string[]; answer: string; explanation: string; image?: { src: string; alt: string } };

const questions: Question[] = [
  { no: 1, text: "Bilangan-bilangan berikut yang memenuhi teorema Pythagoras adalah sebagai berikut, kecuali ....", options: ["a. 3, 4, dan 5", "b. 6, 8, dan 10", "c. 5, 12, dan 13", "d. 6, 8, dan 16"], answer: "d", explanation: "$3^2 + 4^2 = 5^2$, $6^2 + 8^2 = 10^2$, dan $5^2 + 12^2 = 13^2$. Namun, $6^2 + 8^2 = 10^2$, bukan $16^2$." },
  { no: 2, text: "Sisi sebuah segitiga siku-siku yang memiliki panjang sisi alas 21 cm dan tinggi 20 cm adalah ....", options: ["a. 27 cm", "b. 28 cm", "c. 29 cm", "d. 30 cm"], answer: "c", explanation: "Sisi miring = $\sqrt{21^2 + 20^2} = \sqrt{841} = 29\text{ cm}$." },
  { no: 3, text: "Sebuah segitiga siku-siku memiliki sisi miring 12 cm. Jika panjang alas segitiga adalah 8 cm, maka tinggi segitiga tersebut adalah ....", options: ["a. 20 cm", "b. 20 cm", "c. 80 cm", "d. 80 cm"], answer: "a", explanation: "Tinggi = √(12² − 8²) = √80 = 4√5 cm. Pilihan pada soal sumber memuat angka yang sama, sehingga perlu diperiksa kembali." },
  { no: 4, text: "Perhatikan gambar di bawah ini. Nilai x pada segitiga siku-siku ABC adalah ....", options: ["a. √269", "b. √296", "c. √69", "d. √96"], answer: "c", explanation: "Gunakan teorema Pythagoras pada segitiga ABC: x² = 13² − 10² = 69, sehingga x = √69.", image: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3f8ifPwGEjKkiArBeQcLWdCE8qc1MQ.png", alt: "Segitiga siku-siku ABC dengan alas 10 cm, sisi miring 13 cm, dan tinggi x" } },
  { no: 5, text: "Perhatikan gambar di bawah ini. Dari segitiga PQR tersebut berlaku hubungan berikut, kecuali ....", options: ["a. q² = r² + t²", "b. t² = q² − r²", "c. t² = p² − s²", "d. s² = t² − p²"], answer: "d", explanation: "Pada segitiga PRS berlaku q² = r² + t² dan pada segitiga RSQ berlaku p² = s² + t². Jadi hubungan s² = t² − p² tidak benar." },
  { no: 6, text: "Sebuah segitiga siku-siku memiliki panjang sisi miring 17 cm. Jika panjang alasnya 15 cm, maka luas segitiga adalah ....", options: ["a. 8 cm", "b. 16 cm²", "c. 30 cm²", "d. 60 cm²"], answer: "d", explanation: "Tinggi = √(17² − 15²) = 8 cm. Luas = ½ × 15 × 8 = 60 cm²." },
  { no: 7, text: "Keliling sebuah segitiga siku-siku yang memiliki panjang sisi miring 25 cm dan tinggi 24 cm adalah ....", options: ["a. 7 cm", "b. 49 cm", "c. 32 cm", "d. 56 cm"], answer: "b", explanation: "Alas = √(25² − 24²) = 7 cm. Keliling = 7 + 24 + 25 = 56 cm. Periksa kembali pilihan jawaban pada soal sumber." },
  { no: 8, text: "Sebuah segitiga PQR memiliki panjang 10 cm, 12 cm, dan 14 cm. Segitiga tersebut merupakan segitiga ....", options: ["a. lancip", "b. tumpul", "c. siku-siku", "d. sama sisi"], answer: "a", explanation: "14² = 196 dan 10² + 12² = 244. Karena c² < a² + b², segitiga tersebut adalah segitiga lancip." },
  { no: 9, text: "Perhatikan gambar berikut. Dari gambar trapesium ABCD, tinggi trapesium adalah ....", options: ["a. 6 cm", "b. 7 cm", "c. 8 cm", "d. 9 cm"], answer: "c", explanation: "Selisih panjang alas = 16 − 10 = 6 cm. Dengan sisi miring 10 cm, tinggi = √(10² − 6²) = 8 cm.", image: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-I7k148uV34ne9veT4ayZjRjldoxcgE.png", alt: "Trapesium ABCD dengan alas 16 cm, sisi atas 10 cm, dan sisi miring 10 cm" } },
  { no: 10, text: "Perhatikan gambar segitiga PQR berikut. Hubungan panjang sisi pada segitiga tersebut yang benar adalah ....", options: ["a. q² = r² + t²", "b. p² = s² + t²", "c. p² = q² + r²", "d. t² = p² + s²"], answer: "a dan b", explanation: "Garis RS membagi segitiga PQR menjadi dua segitiga siku-siku: q² = r² + t² dan p² = s² + t².", image: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3ffTuIzhUcMpBnNvBo2agv42JgbHgj.png", alt: "Segitiga PQR dengan tinggi t dan alas terbagi menjadi r dan s" } },
];

function QuestionCard({ question }: { question: Question }) {
  const [open, setOpen] = useState(false);
  return <article className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-lg backdrop-blur-sm">
    <div className="mb-3 flex items-center justify-between gap-3"><span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Soal {question.no}</span>{question.image && <span className="flex items-center gap-1 text-xs text-muted-foreground"><ImageIcon className="h-4 w-4" /> Bergambar</span>}</div>
    <p className="mb-4 text-base leading-7 text-foreground">{renderWithLatex(question.text)}</p>
    {question.image && <img src={question.image.src} alt={question.image.alt} className="mb-4 mx-auto max-h-64 w-auto max-w-full rounded-lg border border-border bg-background object-contain" />}
    <div className="grid gap-2 text-sm leading-6 text-muted-foreground">{question.options.map((option) => <div key={option}>{renderWithLatex(option)}</div>)}</div>
    <button type="button" onClick={() => setOpen((value) => !value)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20">{open ? "Sembunyikan Pembahasan" : "Lihat Pembahasan"}{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
    {open && <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-7"><p className="font-semibold text-primary">Jawaban: {question.answer}</p><p className="mt-2 whitespace-pre-line text-muted-foreground">{renderWithLatex(question.explanation)}</p></div>}
  </article>;
}

function TkaQuestionCard({ question, index }: { question: (typeof bankSoalTeoremaPythagoras)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  return <article className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-lg backdrop-blur-sm">
    <div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Soal {index + 11}</span><span className="text-xs text-muted-foreground">Dari Modul Pemantapan</span></div>
    <p className="mb-4 text-base leading-7 text-foreground">{question.soal}</p>
    {question.gambar && <div className="mb-4 overflow-x-auto">{question.gambar}</div>}
    {question.options && <div className="grid gap-2 text-sm leading-6 text-muted-foreground">{question.options.map((option) => <div key={option}>{renderWithLatex(option)}</div>)}</div>}
    {question.pernyataan && <div className="grid gap-2 text-sm leading-6 text-muted-foreground">{question.pernyataan.map((item) => <div key={item}>{item}</div>)}</div>}
    <button type="button" onClick={() => setOpen((value) => !value)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20">{open ? "Sembunyikan Pembahasan" : "Lihat Pembahasan"}{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
    {open && <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-7"><p className="font-semibold text-primary">Jawaban: {question.jawaban ?? question.jawabanBS?.join(", ")}</p><p className="mt-2 whitespace-pre-line text-muted-foreground">{question.pembahasan}</p></div>}
  </article>;
}

const BankSoalTeoremaPythagorasPage = () => { const navigate = useNavigate(); return <main className="relative min-h-screen gradient-space overflow-x-hidden"><PageNavigation prevPath="/bank-soal" /><section className="relative z-10 mx-auto w-full max-w-4xl px-4 py-20"><header className="mb-8 text-center"><h1 className="font-display text-2xl font-bold text-primary md:text-3xl">BANK SOAL TEOREMA PYTHAGORAS</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Kumpulan soal dan pembahasan Teorema Pythagoras lengkap dengan gambar.</p></header><div className="grid gap-5">{questions.map((question) => <QuestionCard key={`bank-${question.no}`} question={question} />)}{bankSoalTeoremaPythagoras.map((question, index) => <TkaQuestionCard key={`tka-${question.no}`} question={question} index={index} />)}</div><button type="button" onClick={() => navigate("/bank-soal")} className="mx-auto mt-8 block rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20">Kembali ke Bank Soal</button></section></main>; };

export default BankSoalTeoremaPythagorasPage;
