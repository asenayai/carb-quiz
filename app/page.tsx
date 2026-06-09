import { NicknameForm } from "@/components/NicknameForm";
import { ScienceChip } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-12 sm:px-10">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-2xl shadow-lg shadow-sky-200">
          🧬
        </div>
        <ScienceChip>MWIT Biology Class</ScienceChip>
        <h1 className="font-heading mt-3 text-3xl font-bold tracking-tight text-slate-800">
          คาร์โบไฮเดรต
        </h1>
        <p className="mt-2 text-base text-slate-500">
          ใส่ชื่อเล่นแล้วเริ่มเลย
        </p>
      </header>
      <NicknameForm />
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ScienceChip>glycosidic linkage</ScienceChip>
        <ScienceChip>hydrolysis</ScienceChip>
        <ScienceChip>5 ข้อ</ScienceChip>
      </div>
    </main>
  );
}
