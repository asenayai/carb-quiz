import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-lg font-medium tracking-tight">ผลคะแนน</h1>
        <p className="mt-1 text-sm text-zinc-500">
          คาร์โบไฮเดรต Quiz · Supabase
        </p>
      </header>
      <AdminDashboard />
    </main>
  );
}
