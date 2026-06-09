"use client";

import Image from "next/image";
import { useState } from "react";
import { QUESTIONS } from "@/lib/quiz-data";
import { Button, Card } from "./ui";

type Props = {
  password: string;
  questionImages: Record<string, string>;
  onUpdated: () => void;
};

export function AdminImageManager({
  password,
  questionImages,
  onUpdated,
}: Props) {
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function upload(question: number, file: File) {
    setUploading(question);
    setMessage("");
    try {
      const form = new FormData();
      form.append("question", String(question));
      form.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "อัปโหลดไม่สำเร็จ");
      setMessage(`อัปเดตรูปข้อ ${question} แล้ว`);
      onUpdated();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setUploading(null);
    }
  }

  async function resetImage(question: number) {
    setUploading(question);
    setMessage("");
    try {
      const res = await fetch(
        `/api/admin/upload-image?question=${question}`,
        {
          method: "DELETE",
          headers: { "x-admin-password": password },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "คืนค่าไม่สำเร็จ");
      setMessage(`คืนรูปข้อ ${question} เป็นค่าเริ่มต้น`);
      onUpdated();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setUploading(null);
    }
  }

  return (
    <Card className="border-amber-100">
      <h3 className="font-heading mb-1 text-base font-bold text-slate-800">
        เปลี่ยนรูปข้อสอบ
      </h3>
      <p className="mb-4 text-sm text-slate-500">
        อัปโหลด PNG/JPEG/WebP (สูงสุด 5 MB) · นักเรียนเห็นรูปใหม่ทันที
      </p>

      <div className="space-y-4">
        {QUESTIONS.map((q) => {
          const src = questionImages[String(q.id)] || q.image;
          return (
            <div
              key={q.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-20 sm:w-36">
                {src && (
                  <Image
                    src={src}
                    alt={`ข้อ ${q.id}`}
                    fill
                    className="object-contain p-1"
                    unoptimized={src.includes("supabase.co")}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-semibold text-slate-700">
                  ข้อ {q.id}
                </p>
                <p className="truncate text-xs text-slate-400">{q.text}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={uploading === q.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) upload(q.id, file);
                      e.target.value = "";
                    }}
                  />
                  <span className="font-heading inline-block rounded-xl border-b-4 border-sky-600 bg-sky-500 px-3 py-2 text-xs font-semibold text-white">
                    {uploading === q.id ? "..." : "เลือกรูป"}
                  </span>
                </label>
                <Button
                  variant="ghost"
                  className="!px-3 !py-2 !text-xs"
                  disabled={uploading === q.id}
                  onClick={() => resetImage(q.id)}
                >
                  คืนค่าเดิม
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {message && (
        <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
      )}
    </Card>
  );
}
