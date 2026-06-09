"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input } from "./ui";

const NICKNAME_KEY = "carb-quiz-nickname";

export function getStoredNickname(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(NICKNAME_KEY);
}

export function NicknameForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  function handleStart() {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("ใส่ชื่อเล่นก่อนนะ");
      return;
    }
    sessionStorage.setItem(NICKNAME_KEY, trimmed.slice(0, 24));
    router.push("/quiz");
  }

  return (
    <Card className="mx-auto max-w-md">
      <label htmlFor="nickname" className="font-heading mb-2 block text-sm font-semibold text-slate-600">
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
