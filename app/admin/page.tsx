import { AdminDashboard } from "@/components/AdminDashboard";
import { ScienceChip } from "@/components/ui";

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <header className="mb-8 text-center">
        <ScienceChip>MWIT Biology Class</ScienceChip>
        <h1 className="font-heading mt-3 text-2xl font-bold text-slate-800">
          Teacher Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          คาร์โบไฮเดรต Quiz · สถิติการตอบของนักเรียน
        </p>
      </header>
      <AdminDashboard />
    </main>
  );
}
