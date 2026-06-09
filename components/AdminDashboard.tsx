"use client";

import { useState } from "react";
import { Button, Card, Input } from "./ui";
import type { QuestionStat } from "@/lib/types";

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

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/results", {
        headers: { "x-admin-password": password },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-2">
        <Input
          type="password"
          placeholder="รหัสครู"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="max-w-xs"
        />
        <Button onClick={load} disabled={loading}>
          {loading ? "กำลังโหลด..." : "โหลดผล"}
        </Button>
        {data && (
          <Button
            onClick={exportCsv}
            className="border-zinc-600 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            Export CSV
          </Button>
        )}
        {error && <p className="w-full text-sm text-red-400">{error}</p>}
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [data.summary.total_attempts, "ครั้ง"],
              [data.summary.unique_students, "นักเรียน"],
              [data.summary.avg_score, "คะแนนเฉลี่ย"],
              [`${data.summary.avg_pct}%`, "เฉลี่ย"],
            ].map(([val, label]) => (
              <Card key={String(label)} className="text-center">
                <p className="text-xl font-medium tabular-nums">{val}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="mb-3 text-sm text-zinc-400">วิเคราะห์รายข้อ</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th className="pb-2">ข้อ</th>
                  <th>ถูก</th>
                  <th>ทั้งหมด</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {data.question_stats.map((s) => (
                  <tr key={s.question_num} className="border-t border-zinc-800">
                    <td className="py-2">ข้อ {s.question_num}</td>
                    <td>{s.correct_count}</td>
                    <td>{s.total_attempts}</td>
                    <td>{s.pct_correct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th className="pb-2 pr-3">เวลา</th>
                  <th className="pr-3">ชื่อ</th>
                  <th className="pr-3">คะแนน</th>
                  <th className="pr-3">ถูก</th>
                  <th>รายข้อ</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((r) => {
                  const pct = Math.round((r.score / r.max_score) * 100);
                  return (
                    <tr
                      key={`${r.created_at}-${r.student_name}`}
                      className="border-t border-zinc-800"
                    >
                      <td className="py-2 pr-3 text-xs text-zinc-500">
                        {new Date(r.created_at).toLocaleString("th-TH")}
                      </td>
                      <td className="pr-3">{r.student_name}</td>
                      <td className="mono-science pr-3 tabular-nums">
                        {r.score}/{r.max_score} ({pct}%)
                      </td>
                      <td className="pr-3">
                        {r.correct_count}/{r.total_questions}
                      </td>
                      <td className="text-xs text-zinc-500">
                        {(r.answers || [])
                          .map(
                            (a) =>
                              `ข้อ${a.question}${a.is_correct ? "✓" : "✗"}`
                          )
                          .join(" ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
