import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providersTable = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  location: text("location").notNull(),
  skills: text("skills").array().notNull().default([]),
  avatar: text("avatar"),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
  completedGigs: integer("completed_gigs").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({ id: true, joinedAt: true, rating: true, reviewCount: true, totalEarnings: true, completedGigs: true });
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;
