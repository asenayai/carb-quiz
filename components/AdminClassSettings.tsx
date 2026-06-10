"use client";

import { useEffect, useState } from "react";
import { CLASS_ROOMS, isValidClassRoom, mergeClassLabels } from "@/lib/class-rooms";
import { Button, Card, Input } from "./ui";

type Props = {
  password: string;
  currentClass: string;
  classLabels: string[];
  selectedClass: string;
  onClassChange: (label: string) => void;
  onRefresh: () => void;
};

export function AdminClassSettings({
  password,
  currentClass,
  classLabels,
  selectedClass,
  onClassChange,
  onRefresh,
}: Props) {
  const [newClass, setNewClass] = useState<string>(
    isValidClassRoom(currentClass) ? currentClass : CLASS_ROOMS[0]
  );

  useEffect(() => {
    setNewClass(isValidClassRoom(currentClass) ? currentClass : CLASS_ROOMS[0]);
  }, [currentClass]);
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetScope, setResetScope] = useState<"class" | "all">("class");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function saveClass() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ currentClass: newClass.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "บันทึกไม่สำเร็จ");
      setMessage(`ตั้งชั้นเรียนปัจจุบันเป็น "${newClass.trim()}" แล้ว`);
      onRefresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (resetConfirm !== "RESET") {
      setMessage('พิมพ์ RESET เพื่อยืนยัน');
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          confirm: "RESET",
          scope: resetScope,
          classLabel:
            resetScope === "class" ? selectedClass || currentClass : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "รีเซ็ตไม่สำเร็จ");
      setMessage(`ลบข้อมูล ${json.deleted} รายการแล้ว`);
      setResetConfirm("");
      onRefresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-sky-100">
      <h3 className="font-heading mb-1 text-base font-bold text-slate-800">
        ชั้นเรียน
      </h3>
      <p className="mb-4 text-sm text-slate-500">
        นักเรียนกรอกชั้น/ห้องที่หน้าแรก · กรองและรีเซ็ตผลตามชั้นได้ที่นี่
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="font-heading block text-sm font-medium text-slate-600">
            ค่าเริ่มต้น (ใช้เมื่อนักเรียนไม่ได้กรอกชั้น/ห้อง)
          </label>
          <div className="flex gap-2">
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
            >
              {CLASS_ROOMS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
            <Button onClick={saveClass} disabled={busy}>
              บันทึก
            </Button>
          </div>
          <p className="text-xs text-teal-700">
            กำลังใช้: <strong>{currentClass}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <label className="font-heading block text-sm font-medium text-slate-600">
            ดูผลตามชั้น
          </label>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
          >
            <option value="">ทุกห้อง</option>
            {mergeClassLabels(classLabels).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-red-100 bg-red-50/50 p-4">
        <h4 className="font-heading text-sm font-bold text-red-700">
          รีเซ็ตข้อมูล
        </h4>
        <p className="mt-1 text-xs text-red-600/80">
          ลบคะแนนและประวัติ — ใช้เมื่อเริ่มชั้นเรียนใหม่ (ไม่สามารถกู้คืน)
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="radio"
              checked={resetScope === "class"}
              onChange={() => setResetScope("class")}
              className="accent-red-500"
            />
            เฉพาะชั้น: {selectedClass || currentClass}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="radio"
              checked={resetScope === "all"}
              onChange={() => setResetScope("all")}
              className="accent-red-500"
            />
            ทุกชั้นเรียน
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.value)}
            placeholder='พิมพ์ RESET เพื่อยืนยัน'
            className="max-w-xs"
          />
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="font-heading rounded-xl border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            ลบข้อมูล
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
      )}
    </Card>
  );
}
