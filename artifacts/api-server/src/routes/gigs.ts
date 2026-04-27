import { Router } from "express";
import { db, gigsTable, providersTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import { ListGigsQueryParams, CreateGigBody, GetGigParams, UpdateGigBody } from "@workspace/api-zod";

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
    const [provider] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.id, parsed.data.providerId));
    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    const [gig] = await db
      .insert(gigsTable)
      .values({
        ...parsed.data,
        providerName: provider.name,
        providerAvatar: provider.avatar,
      })
      .returning();
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

router.patch("/:id", async (req, res) => {
  try {
    const idParsed = GetGigParams.safeParse({ id: Number(req.params.id) });
    const bodyParsed = UpdateGigBody.safeParse(req.body);

    if (!idParsed.success) {
      res.status(400).json({ error: "Invalid gig ID" });
      return;
    }
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const updates: Record<string, unknown> = {};
    const body = bodyParsed.data;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.price !== undefined) updates.price = body.price;
    if (body.location !== undefined) updates.location = body.location;
    if (body.status !== undefined) updates.status = body.status;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;

    if (Object.keys(updates).length === 0) {
      const [existing] = await db.select().from(gigsTable).where(eq(gigsTable.id, idParsed.data.id));
      if (!existing) {
        res.status(404).json({ error: "Gig not found" });
        return;
      }
      res.json(existing);
      return;
    }

    const [updated] = await db
      .update(gigsTable)
      .set(updates)
      .where(eq(gigsTable.id, idParsed.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Gig not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update gig");
    res.status(500).json({ error: "Failed to update gig" });
  }
});

export default router;
