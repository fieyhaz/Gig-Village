import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gigsTable = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  location: text("location").notNull(),
  providerId: integer("provider_id").notNull(),
  providerName: text("provider_name").notNull(),
  providerAvatar: text("provider_avatar"),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGigSchema = createInsertSchema(gigsTable).omit({ id: true, createdAt: true, rating: true, reviewCount: true });
export type InsertGig = z.infer<typeof insertGigSchema>;
export type Gig = typeof gigsTable.$inferSelect;
