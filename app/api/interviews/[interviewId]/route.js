import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { InterviewSessionTable, SpeakSmartAI, UserAnswerTable } from "@/utils/schema";

export async function GET(_req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = await params;

    const rows = await db
      .select()
      .from(InterviewSessionTable)
      .where(
        and(
          eq(InterviewSessionTable.mockId, interviewId),
          eq(InterviewSessionTable.userId, userId)
        )
      )
      .limit(1);

    if (!rows.length) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ interview: rows[0] });
  } catch (error) {
    console.error("Failed to load interview:", error);
    return NextResponse.json({ error: "Failed to load interview" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = await params;

    const owned = await db
      .select({
        id: InterviewSessionTable.id,
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

    if (!owned.length) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const ownerEmail = owned[0]?.userEmail;

    if (ownerEmail) {
      await db
        .delete(UserAnswerTable)
        .where(
          and(
            eq(UserAnswerTable.mockId, interviewId),
            eq(UserAnswerTable.userEmail, ownerEmail)
          )
        );
    } else {
      await db.delete(UserAnswerTable).where(eq(UserAnswerTable.mockId, interviewId));
    }

    await db
      .delete(SpeakSmartAI)
      .where(
        and(
          eq(SpeakSmartAI.mockId, interviewId),
          eq(SpeakSmartAI.createdBy, userId)
        )
      );
    await db
      .delete(InterviewSessionTable)
      .where(
        and(
          eq(InterviewSessionTable.mockId, interviewId),
          eq(InterviewSessionTable.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete interview:", error);
    return NextResponse.json({ error: "Failed to delete interview" }, { status: 500 });
  }
}
