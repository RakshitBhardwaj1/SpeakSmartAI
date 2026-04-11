import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const EMPTY_STREAK = {
  isActive: false,
  completedToday: false,
  daysCompleted: 0,
  streakEndDate: null,
};

async function handleLogin() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ streak: EMPTY_STREAK });
}

export async function GET() {
  return handleLogin();
}

export async function POST() {
  return handleLogin();
}
