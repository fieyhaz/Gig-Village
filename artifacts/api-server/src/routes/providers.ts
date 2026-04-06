import { Router } from "express";
import { db, providersTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { ListProvidersQueryParams, CreateProviderBody, GetProviderParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const parsed = ListProvidersQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    let query = db.select().from(providersTable).$dynamic();

    const conditions = [];
    if (params.location) {
      conditions.push(ilike(providersTable.location, `%${params.location}%`));
    }
    if (params.skill) {
      conditions.push(sql`${params.skill} = ANY(${providersTable.skills})`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const providers = await query;
    res.json(providers);
  } catch (err) {
    req.log.error({ err }, "Failed to list providers");
    res.status(500).json({ error: "Failed to list providers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateProviderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error });
      return;
    }
    const [provider] = await db.insert(providersTable).values(parsed.data).returning();
    res.status(201).json(provider);
  } catch (err) {
    req.log.error({ err }, "Failed to create provider");
    res.status(500).json({ error: "Failed to create provider" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const parsed = GetProviderParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid provider ID" });
      return;
    }
    const [provider] = await db.select().from(providersTable).where(eq(providersTable.id, parsed.data.id));
    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    res.json(provider);
  } catch (err) {
    req.log.error({ err }, "Failed to get provider");
    res.status(500).json({ error: "Failed to get provider" });
  }
});

export default router;
