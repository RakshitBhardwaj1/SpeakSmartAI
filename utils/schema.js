import { pgTable, integer, varchar, text } from "drizzle-orm/pg-core";

// Session-level storage for interview generation metadata.
export const SpeakSmartAI = pgTable("speak_smart_ai", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  jsonResp: text("json_resp").notNull(),
  jobPosition: varchar("job_position").notNull(),
  jobDescription: text("job_description").notNull(),
  jobExperience: varchar("job_experience").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: varchar("created_at").notNull(),
  mockId: varchar("mock_id").notNull(),
  userEmail: varchar("user_email"),
  updatedAt: varchar("updated_at"), // Testing new field
});

export const InterviewSessionTable = pgTable("interview_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mockId: varchar("mock_id"),
  interviewQuestions: text("interview_questions"),
  resumeUrl: text("resume_url"),
  userId: varchar("user_id"),
  userEmail: varchar("user_email"),
  jobPosition: varchar("job_position"),
  jobDescription: text("job_description"),
  skills: text("skills"),
  jobExperience: varchar("job_experience"),
  createdAt: varchar("created_at"),
  status: varchar("status"),
});

