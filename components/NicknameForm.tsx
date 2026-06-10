"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLASS_ROOMS, isValidClassRoom } from "@/lib/class-rooms";
import { Button, Card, Input } from "./ui";

export const NICKNAME_KEY = "carb-quiz-nickname";
export const CLASS_KEY = "carb-quiz-class";

const selectClass =
  "w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100";

export function getStoredNickname(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(NICKNAME_KEY);
}

export function getStoredClass(): string | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(CLASS_KEY);
  return value && isValidClassRoom(value) ? value : null;
}

export function NicknameForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [error, setError] = useState("");

  function handleStart() {
    const trimmedName = nickname.trim();

    if (!classRoom) {
      setError("เลือกห้องก่อนนะ");
      return;
    }
    if (!trimmedName) {
      setError("ใส่ชื่อเล่นก่อนนะ");
      return;
    }

    sessionStorage.setItem(NICKNAME_KEY, trimmedName.slice(0, 24));
    sessionStorage.setItem(CLASS_KEY, classRoom);
    router.push("/quiz");
  }

  return (
    <Card className="mx-auto w-full">
      <label
        htmlFor="class-room"
        className="font-heading mb-2 block text-sm font-semibold text-slate-600"
      >
        ม.4 ห้อง
      </label>
      <select
        id="class-room"
        value={classRoom}
        onChange={(e) => {
          setClassRoom(e.target.value);
          setError("");
        }}
        className={selectClass}
      >
        <option value="">เลือกห้อง</option>
        {CLASS_ROOMS.map((room) => (
          <option key={room} value={room}>
            {room}
          </option>
        ))}
      </select>

      <label
        htmlFor="nickname"
        className="font-heading mb-2 mt-4 block text-sm font-semibold text-slate-600"
      >
        ชื่อเล่น
      </label>
      <Input
        id="nickname"
        placeholder="เช่น มะม่วง, Tar, ก.ไก่"
        maxLength={24}
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleStart()}
        autoFocus
      />
      {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}
      <Button className="mt-4 w-full" onClick={handleStart}>
        เริ่มเลย
      </Button>
    </Card>
  );
}
