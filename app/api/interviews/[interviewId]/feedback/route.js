import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { InterviewSessionTable, UserAnswerTable } from "@/utils/schema";

export async function GET(_req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = await params;

    const sessions = await db
      .select({
        id: InterviewSessionTable.id,
        interviewQuestions: InterviewSessionTable.interviewQuestions,
        userEmail: InterviewSessionTable.userEmail,
      })
      .from(InterviewSessionTable)
      .where(
        and(
          eq(InterviewSessionTable.mockId, interviewId),
          eq(InterviewSessionTable.userId, userId)
        )
      )
      .limit(1);

    if (!sessions.length) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const ownerEmail = sessions[0]?.userEmail;

    const answers = ownerEmail
      ? await db
          .select()
          .from(UserAnswerTable)
          .where(
            and(
              eq(UserAnswerTable.mockId, interviewId),
              eq(UserAnswerTable.userEmail, ownerEmail)
            )
          )
      : await db
          .select()
          .from(UserAnswerTable)
          .where(eq(UserAnswerTable.mockId, interviewId));

    let sessionQuestions = [];
    try {
      const raw = sessions[0]?.interviewQuestions;
      const parsed = raw ? JSON.parse(raw) : [];
      sessionQuestions = Array.isArray(parsed) ? parsed : parsed?.questions || [];
    } catch {
      sessionQuestions = [];
    }

    return NextResponse.json({ feedback: answers, sessionQuestions });
  } catch (error) {
    console.error("Failed to load interview feedback:", error);
    return NextResponse.json({ error: "Failed to load interview feedback" }, { status: 500 });
  }
}
