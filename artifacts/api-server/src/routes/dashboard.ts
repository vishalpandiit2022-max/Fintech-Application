import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, expensesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

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
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    const allExpenses = await db.select().from(expensesTable).where(eq(expensesTable.userId, userId));
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netSavings = user.salary - totalExpenses;
    const savingsRate = user.salary > 0 ? (netSavings / user.salary) * 100 : 0;

    const recentExpenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.userId, userId))
      .orderBy(desc(expensesTable.id))
      .limit(5);

    res.json({
      salary: user.salary,
      totalExpenses,
      netSavings,
      savingsRate,
      recentExpenses: recentExpenses.map(e => ({
        id: e.id,
        userId: e.userId,
        description: e.description,
        category: e.category,
        amount: e.amount,
        date: e.date,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
