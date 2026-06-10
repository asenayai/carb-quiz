"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input } from "./ui";

export const NICKNAME_KEY = "carb-quiz-nickname";
export const CLASS_KEY = "carb-quiz-class";

export function getStoredNickname(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(NICKNAME_KEY);
}

export function getStoredClass(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CLASS_KEY);
}

export function NicknameForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [error, setError] = useState("");

  function handleStart() {
    const trimmedName = nickname.trim();
    const trimmedClass = classRoom.trim();

    if (!trimmedName) {
      setError("ใส่ชื่อเล่นก่อนนะ");
      return;
    }
    if (!trimmedClass) {
      setError("ใส่ชั้น/ห้องก่อนนะ");
      return;
    }

    sessionStorage.setItem(NICKNAME_KEY, trimmedName.slice(0, 24));
    sessionStorage.setItem(CLASS_KEY, trimmedClass.slice(0, 48));
    router.push("/quiz");
  }

  return (
    <Card className="mx-auto w-full">
      <label
        htmlFor="class-room"
        className="font-heading mb-2 block text-sm font-semibold text-slate-600"
      >
        ชั้น / ห้อง
      </label>
      <Input
        id="class-room"
        placeholder="เช่น M.4/1, ม.4 ห้อง 2"
        maxLength={48}
        value={classRoom}
        onChange={(e) => {
          setClassRoom(e.target.value);
          setError("");
        }}
        autoFocus
      />

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
      />
      {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}
      <Button className="mt-4 w-full" onClick={handleStart}>
        เริ่มเลย
      </Button>
    </Card>
  );
}
