import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull(),
  gigTitle: text("gig_title").notNull(),
  providerId: integer("provider_id").notNull(),
  providerName: text("provider_name").notNull(),
  customerUserId: integer("customer_user_id"),
  customerName: text("customer_name").notNull(),
  customerContact: text("customer_contact").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: real("total_amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
