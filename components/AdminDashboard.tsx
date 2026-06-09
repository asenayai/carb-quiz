"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input } from "./ui";
import type { QuestionStat } from "@/lib/types";

const AUTH_KEY = "carb-quiz-admin-auth";

type AttemptRow = {
  created_at: string;
  student_name: string;
  student_id?: string | null;
  score: number;
  max_score: number;
  correct_count: number;
  total_questions: number;
  duration_sec?: number | null;
  answers: { question: number; is_correct: boolean }[];
};

type ResultsData = {
  summary: {
    total_attempts: number;
    unique_students: number;
    avg_score: number;
    avg_pct: number;
  };
  question_stats: QuestionStat[];
  attempts: AttemptRow[];
};

function StatCard({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${accent}`}
    >
      <p className="font-heading text-3xl font-bold tabular-nums text-slate-800">
        {value}
      </p>
      <p className="font-accent mt-1 text-base text-slate-500">{label}</p>
    </div>
  );
}

function QuestionBar({ stat }: { stat: QuestionStat }) {
  const pct = stat.pct_correct;
  const barColor =
    pct >= 80
      ? "from-emerald-400 to-teal-500"
      : pct >= 50
        ? "from-sky-400 to-blue-500"
        : "from-amber-400 to-orange-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-heading font-medium text-slate-700">
          ข้อ {stat.question_num}
        </span>
        <span className="font-heading tabular-nums text-slate-500">
          {stat.correct_count}/{stat.total_attempts}{" "}
          <span className="font-semibold text-slate-700">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StudentRow({ row }: { row: AttemptRow }) {
  const pct = Math.round((row.score / row.max_score) * 100);
  const initial = row.student_name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 transition hover:bg-slate-50">
      <div className="font-heading flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-sky-500 text-sm font-bold text-white">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading truncate font-semibold text-slate-800">
          {row.student_name}
        </p>
        <p className="text-xs text-slate-400">
          {new Date(row.created_at).toLocaleString("th-TH", {
            dateStyle: "short",
            timeStyle: "short",
          })}
          {row.duration_sec != null && ` · ${row.duration_sec} วินาที`}
        </p>
      </div>
      <div className="text-right">
        <p className="font-heading text-lg font-bold tabular-nums text-emerald-600">
          {pct}%
        </p>
        <p className="text-xs text-slate-400">
          {row.correct_count}/{row.total_questions} ข้อ
        </p>
      </div>
      <div className="hidden gap-0.5 sm:flex">
        {(row.answers || []).map((a) => (
          <span
            key={a.question}
            className={`font-heading flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
              a.is_correct
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            }`}
            title={`ข้อ ${a.question}`}
          >
            {a.question}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated && password) {
      load(password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  async function load(pwd = password) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/results", {
        headers: { "x-admin-password": pwd },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setData(null);
      if (e instanceof Error && e.message === "Unauthorized") {
        sessionStorage.removeItem(AUTH_KEY);
        setAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    if (!password.trim()) {
      setError("ใส่รหัสครูก่อนนะ");
      return;
    }
    sessionStorage.setItem(AUTH_KEY, password);
    setAuthenticated(true);
    setError("");
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    setPassword("");
    setAuthenticated(false);
    setData(null);
    setError("");
  }

  function exportCsv() {
    if (!data?.attempts.length) return;
    const header = [
      "created_at",
      "student_name",
      "score",
      "max_score",
      "correct_count",
      "q1",
      "q2",
      "q3",
      "q4",
      "q5",
    ];
    const lines = [header.join(",")];
    data.attempts.forEach((r) => {
      const qs = (r.answers || []).reduce<Record<number, number>>(
        (m, a) => {
          m[a.question] = a.is_correct ? 1 : 0;
          return m;
        },
        {}
      );
      lines.push(
        [
          r.created_at,
          `"${r.student_name.replace(/"/g, '""')}"`,
          r.score,
          r.max_score,
          r.correct_count,
          qs[1] ?? "",
          qs[2] ?? "",
          qs[3] ?? "",
          qs[4] ?? "",
          qs[5] ?? "",
        ].join(",")
      );
    });
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "carb-quiz-results.csv";
    a.click();
  }

  if (!authenticated) {
    return (
      <Card className="mx-auto max-w-md border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-2xl text-white shadow-md">
            🔐
          </div>
          <h2 className="font-heading text-xl font-bold text-slate-800">
            เข้าสู่ระบบครู
          </h2>
          <p className="font-accent mt-1 text-base text-slate-500">
            MWIT Biology Class · Admin
          </p>
        </div>
        <div className="mt-6 space-y-3">
          <Input
            type="password"
            placeholder="รหัสครู"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoFocus
          />
          {error && (
            <p className="text-center text-sm font-medium text-red-500">
              {error}
            </p>
          )}
          <Button className="w-full" onClick={handleLogin}>
            เข้าสู่แดชบอร์ด
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-accent text-base text-teal-700">
            MWIT Biology Class
          </p>
          <h2 className="font-heading text-lg font-bold text-slate-800">
            สรุปผลนักเรียน
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => load()} disabled={loading}>
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </Button>
          {data && (
            <Button variant="secondary" onClick={exportCsv}>
              Export CSV
            </Button>
          )}
          <Button variant="ghost" onClick={handleLogout}>
            ออกจากระบบ
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {loading && !data && (
        <div className="py-16 text-center">
          <p className="font-accent text-lg text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              value={data.summary.total_attempts}
              label="ครั้งที่ทำ"
              accent="border-l-4 border-l-sky-400"
            />
            <StatCard
              value={data.summary.unique_students}
              label="นักเรียน"
              accent="border-l-4 border-l-teal-400"
            />
            <StatCard
              value={data.summary.avg_score}
              label="คะแนนเฉลี่ย"
              accent="border-l-4 border-l-emerald-400"
            />
            <StatCard
              value={`${data.summary.avg_pct}%`}
              label="เปอร์เซ็นต์เฉลี่ย"
              accent="border-l-4 border-l-amber-400"
            />
          </div>

          {data.question_stats.length > 0 && (
            <Card className="border-teal-100">
              <h3 className="font-heading mb-4 text-base font-bold text-slate-800">
                วิเคราะห์รายข้อ
              </h3>
              <div className="space-y-4">
                {data.question_stats.map((s) => (
                  <QuestionBar key={s.question_num} stat={s} />
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-heading mb-4 text-base font-bold text-slate-800">
              ผลล่าสุด
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({data.attempts.length} รายการ)
              </span>
            </h3>
            {data.attempts.length === 0 ? (
              <p className="font-accent py-8 text-center text-base text-slate-400">
                ยังไม่มีนักเรียนทำ quiz
              </p>
            ) : (
              <div className="space-y-2">
                {data.attempts.map((r) => (
                  <StudentRow
                    key={`${r.created_at}-${r.student_name}-${r.score}`}
                    row={r}
                  />
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
