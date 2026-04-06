import { Router } from "express";
import { db, gigsTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import { ListGigsQueryParams, CreateGigBody, GetGigParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const parsed = ListGigsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    let query = db.select().from(gigsTable).$dynamic();

    const conditions = [];
    if (params.category) {
      conditions.push(eq(gigsTable.category, params.category));
    }
    if (params.location) {
      conditions.push(ilike(gigsTable.location, `%${params.location}%`));
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(gigsTable.title, `%${params.search}%`),
          ilike(gigsTable.description, `%${params.search}%`),
        )!,
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const gigs = await query;
    res.json(gigs);
  } catch (err) {
    req.log.error({ err }, "Failed to list gigs");
    res.status(500).json({ error: "Failed to list gigs" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateGigBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error });
      return;
    }
    const [gig] = await db.insert(gigsTable).values(parsed.data).returning();
    res.status(201).json(gig);
  } catch (err) {
    req.log.error({ err }, "Failed to create gig");
    res.status(500).json({ error: "Failed to create gig" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const parsed = GetGigParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid gig ID" });
      return;
    }
    const [gig] = await db.select().from(gigsTable).where(eq(gigsTable.id, parsed.data.id));
    if (!gig) {
      res.status(404).json({ error: "Gig not found" });
      return;
    }
    res.json(gig);
  } catch (err) {
    req.log.error({ err }, "Failed to get gig");
    res.status(500).json({ error: "Failed to get gig" });
  }
});

export default router;
