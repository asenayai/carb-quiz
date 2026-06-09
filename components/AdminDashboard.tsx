"use client";

import { useEffect, useState } from "react";
import { AdminClassSettings } from "./AdminClassSettings";
import { AdminImageManager } from "./AdminImageManager";
import { Button, Card, Input } from "./ui";
import type { QuestionStat } from "@/lib/types";

const AUTH_KEY = "carb-quiz-admin-auth";

type AttemptRow = {
  created_at: string;
  class_label?: string;
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
  refreshed_at?: string;
  class_labels?: string[];
  current_class?: string;
  question_images?: Record<string, string>;
};

const AUTO_REFRESH_MS = 30_000;

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

function formatSubmittedAt(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { date, time, full: `${date} ${time}` };
}

function SubmissionsTable({ attempts }: { attempts: AttemptRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
            <th className="pb-3 pr-4 font-heading">ส่งเมื่อ</th>
            <th className="pb-3 pr-4 font-heading">ชั้น</th>
            <th className="pb-3 pr-4 font-heading">ชื่อเล่น</th>
            <th className="pb-3 pr-4 font-heading">คะแนน</th>
            <th className="pb-3 pr-4 font-heading">ถูก</th>
            <th className="pb-3 pr-4 font-heading">ใช้เวลา</th>
            <th className="pb-3 font-heading">รายข้อ</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((row) => {
            const pct = Math.round((row.score / row.max_score) * 100);
            const submitted = formatSubmittedAt(row.created_at);
            return (
              <tr
                key={`${row.created_at}-${row.student_name}-${row.score}`}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 pr-4 align-top">
                  <p className="font-medium tabular-nums text-slate-700">
                    {submitted.date}
                  </p>
                  <p className="text-xs tabular-nums text-slate-400">
                    {submitted.time}
                  </p>
                </td>
                <td className="py-3 pr-4 align-top">
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                    {row.class_label || "ทั่วไป"}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top">
                  <p className="font-heading font-semibold text-slate-800">
                    {row.student_name}
                  </p>
                </td>
                <td className="py-3 pr-4 align-top">
                  <p className="font-heading font-bold tabular-nums text-emerald-600">
                    {pct}%
                  </p>
                  <p className="text-xs tabular-nums text-slate-400">
                    {row.score}/{row.max_score}
                  </p>
                </td>
                <td className="py-3 pr-4 align-top tabular-nums text-slate-600">
                  {row.correct_count}/{row.total_questions}
                </td>
                <td className="py-3 pr-4 align-top text-slate-500">
                  {row.duration_sec != null
                    ? `${row.duration_sec} วินาที`
                    : "—"}
                </td>
                <td className="py-3 align-top">
                  <div className="flex flex-wrap gap-1">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [questionImages, setQuestionImages] = useState<Record<string, string>>(
    {}
  );

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

  useEffect(() => {
    if (authenticated && password) {
      load(password, { quiet: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  useEffect(() => {
    if (!authenticated || !password || !autoRefresh) return;
    const id = setInterval(() => load(password, { quiet: true }), AUTO_REFRESH_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, password, autoRefresh, selectedClass]);

  async function loadSettings(pwd = password) {
    const res = await fetch("/api/admin/settings", {
      cache: "no-store",
      headers: { "x-admin-password": pwd },
    });
    if (res.ok) {
      const json = await res.json();
      setQuestionImages(json.questionImages || {});
    }
  }

  async function load(
    pwd = password,
    opts: { quiet?: boolean } = {}
  ) {
    if (!opts.quiet) setLoading(true);
    setError("");
    try {
      const classQuery = selectedClass
        ? `?class=${encodeURIComponent(selectedClass)}`
        : "";
      const res = await fetch(`/api/results${classQuery}`, {
        cache: "no-store",
        headers: {
          "x-admin-password": pwd,
          "Cache-Control": "no-cache",
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      setData(json);
      if (json.question_images) setQuestionImages(json.question_images);
      await loadSettings(pwd);
      setLastRefreshedAt(
        json.refreshed_at ? new Date(json.refreshed_at) : new Date()
      );
    } catch (e) {
      if (!opts.quiet) {
        setError(e instanceof Error ? e.message : "Error");
        setData(null);
      }
      if (e instanceof Error && e.message === "Unauthorized") {
        sessionStorage.removeItem(AUTH_KEY);
        setAuthenticated(false);
      }
    } finally {
      if (!opts.quiet) setLoading(false);
    }
  }

  function formatLastRefreshed() {
    if (!lastRefreshedAt) return null;
    return lastRefreshedAt.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-accent text-base text-teal-700">
            MWIT Biology Class
          </p>
          <h2 className="font-heading text-lg font-bold text-slate-800">
            สรุปผลนักเรียน
          </h2>
          {lastRefreshedAt && (
            <p className="mt-1 text-xs text-slate-400">
              อัปเดตล่าสุด:{" "}
              <span className="tabular-nums">{formatLastRefreshed()}</span>
              {autoRefresh && (
                <span className="ml-1 text-teal-600">· อัปเดตอัตโนมัติทุก 30 วินาที</span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => load()}
            disabled={loading}
          >
            {loading ? "กำลังโหลด..." : "↻ อัปเดตคะแนน"}
          </Button>
          {data && (
            <Button variant="ghost" onClick={exportCsv}>
              Export CSV
            </Button>
          )}
          <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-teal-600"
            />
            อัตโนมัติ
          </label>
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
          <AdminClassSettings
            password={password}
            currentClass={data.current_class || "ทั่วไป"}
            classLabels={data.class_labels || []}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            onRefresh={() => load()}
          />

          <AdminImageManager
            password={password}
            questionImages={questionImages}
            onUpdated={() => {
              loadSettings();
              load(undefined, { quiet: true });
            }}
          />

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
              <div className="grid gap-4 sm:grid-cols-2">
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
              <SubmissionsTable attempts={data.attempts} />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
