import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { InterviewSessionTable } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await db
      .select()
      .from(InterviewSessionTable)
      .where(eq(InterviewSessionTable.userId, userId))
      .orderBy(desc(InterviewSessionTable.createdAt));

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("Failed to load interviews:", error);
    return NextResponse.json({ error: "Failed to load interviews" }, { status: 500 });
  }
}
