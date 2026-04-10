import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { InterviewSessionTable, UserAnswerTable } from "@/utils/schema";

export async function POST(req) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      mockId,
      question,
      answerText,
      fallbackCorrectAnswer,
      feedbackResult,
    } = body || {};

    const safeMockId = String(mockId || "").trim();
    const safeQuestion = String(question || "").trim();
    const safeAnswer = String(answerText || "").trim();

    if (!safeMockId || !safeQuestion || safeAnswer.length < 2) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const userEmail =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      null;

    if (!userEmail) {
      return NextResponse.json({ error: "User email not available" }, { status: 400 });
    }

    const ownedInterview = await db
      .select({ id: InterviewSessionTable.id })
      .from(InterviewSessionTable)
      .where(
        and(
          eq(InterviewSessionTable.mockId, safeMockId),
          eq(InterviewSessionTable.userId, userId)
        )
      )
      .limit(1);

    if (!ownedInterview.length) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const existing = await db
      .select({ id: UserAnswerTable.id })
      .from(UserAnswerTable)
      .where(
        and(
          eq(UserAnswerTable.mockId, safeMockId),
          eq(UserAnswerTable.question, safeQuestion),
          eq(UserAnswerTable.userEmail, userEmail)
        )
      )
      .limit(1);

    const basePayload = {
      useranswer: safeAnswer,
      correctanswer: String(fallbackCorrectAnswer || "N/A"),
    };

    if (feedbackResult && typeof feedbackResult === "object") {
      basePayload.feedback = JSON.stringify(feedbackResult);
      basePayload.rating = Number(feedbackResult?.rating) || null;
      if (feedbackResult.modelAnswer) {
        basePayload.correctanswer = String(feedbackResult.modelAnswer);
      }
    }

    if (existing.length > 0) {
      await db
        .update(UserAnswerTable)
        .set(basePayload)
        .where(eq(UserAnswerTable.id, existing[0].id));
    } else {
      await db.insert(UserAnswerTable).values({
        mockId: safeMockId,
        question: safeQuestion,
        correctanswer: basePayload.correctanswer,
        useranswer: basePayload.useranswer,
        feedback: basePayload.feedback || null,
        rating: basePayload.rating || null,
        userEmail,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to upsert answer:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
