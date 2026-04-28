import { Router } from "express";
import { db, usersTable, providersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SignInUserBody, GetUserParams } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const parsed = SignInUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error });
      return;
    }
    const { name, email } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail));

    let user = existing;
    if (!user) {
      const [created] = await db.insert(usersTable).values({
        name: name.trim(),
        email: normalizedEmail,
      }).returning();
      user = created;
    } else if (existing.name !== name.trim() && name.trim().length > 0) {
      // keep latest sign-in name
      const [updated] = await db.update(usersTable)
        .set({ name: name.trim() })
        .where(eq(usersTable.id, existing.id))
        .returning();
      user = updated;
    }

    const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user.id));

    res.status(200).json({
      ...user,
      providerId: provider?.id ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to sign in user");
    res.status(500).json({ error: "Failed to sign in" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const parsed = GetUserParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user.id));
    res.json({ ...user, providerId: provider?.id ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
