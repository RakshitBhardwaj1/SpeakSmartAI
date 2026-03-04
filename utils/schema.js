import { pgTable, integer, varchar, text } from "drizzle-orm/pg-core";
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
