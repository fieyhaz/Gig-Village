import { Router } from "express";
import { db, bookingsTable, gigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateBookingBody, GetBookingParams, UpdateBookingStatusParams, UpdateBookingStatusBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const bookings = await db.select().from(bookingsTable);
    res.json(bookings);
  } catch (err) {
    req.log.error({ err }, "Failed to list bookings");
    res.status(500).json({ error: "Failed to list bookings" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateBookingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error });
      return;
    }

    const { gigId, customerName, customerContact, scheduledDate, notes } = parsed.data;

    const [gig] = await db.select().from(gigsTable).where(eq(gigsTable.id, gigId));
    if (!gig) {
      res.status(404).json({ error: "Gig not found" });
      return;
    }

    const [booking] = await db.insert(bookingsTable).values({
      gigId,
      gigTitle: gig.title,
      providerId: gig.providerId,
      providerName: gig.providerName,
      customerName,
      customerContact,
      scheduledDate,
      totalAmount: gig.price,
      notes: notes ?? null,
      status: "pending",
    }).returning();

    res.status(201).json(booking);
  } catch (err) {
    req.log.error({ err }, "Failed to create booking");
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const parsed = GetBookingParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid booking ID" });
      return;
    }
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, parsed.data.id));
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.json(booking);
  } catch (err) {
    req.log.error({ err }, "Failed to get booking");
    res.status(500).json({ error: "Failed to get booking" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateBookingStatusParams.safeParse({ id: Number(req.params.id) });
    const bodyParsed = UpdateBookingStatusBody.safeParse(req.body);

    if (!paramsParsed.success || !bodyParsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const [booking] = await db.update(bookingsTable)
      .set({ status: bodyParsed.data.status })
      .where(eq(bookingsTable.id, paramsParsed.data.id))
      .returning();

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    res.json(booking);
  } catch (err) {
    req.log.error({ err }, "Failed to update booking status");
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

export default router;
