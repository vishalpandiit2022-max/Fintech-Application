import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { savingsGoalsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const goals = await db.select().from(savingsGoalsTable).where(eq(savingsGoalsTable.userId, userId));
    res.json(goals.map(g => ({
      id: g.id,
      userId: g.userId,
      goalName: g.goalName,
      targetAmount: g.targetAmount,
      months: g.months,
      monthlySaving: g.targetAmount / g.months,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { goalName, targetAmount, months } = req.body;
    if (!goalName || targetAmount === undefined || !months) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    const [goal] = await db.insert(savingsGoalsTable).values({
      userId,
      goalName,
      targetAmount: Number(targetAmount),
      months: Number(months),
    }).returning();
    res.status(201).json({
      id: goal.id,
      userId: goal.userId,
      goalName: goal.goalName,
      targetAmount: goal.targetAmount,
      months: goal.months,
      monthlySaving: goal.targetAmount / goal.months,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const id = parseInt(req.params.id);
    await db.delete(savingsGoalsTable).where(and(eq(savingsGoalsTable.id, id), eq(savingsGoalsTable.userId, userId)));
    res.json({ message: "Savings goal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
