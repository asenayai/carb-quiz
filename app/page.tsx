import { NicknameForm } from "@/components/NicknameForm";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <header className="mb-8 text-center">
        <p className="mono-science text-xs tracking-wide text-zinc-500">
          AP Review
        </p>
        <h1 className="mt-2 text-xl font-medium tracking-tight">
          คาร์โบไฮเดรต
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          ใส่ชื่อเล่นแล้วเริ่มเลย
        </p>
      </header>
      <NicknameForm />
      <p className="mt-6 text-center text-xs text-zinc-600">
        5 ข้อ · glycosidic linkage · hydrolysis
      </p>
    </main>
  );
}
