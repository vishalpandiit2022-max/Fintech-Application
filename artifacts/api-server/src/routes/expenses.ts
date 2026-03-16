import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { expensesTable } from "@workspace/db/schema";
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
    const expenses = await db.select().from(expensesTable).where(eq(expensesTable.userId, userId));
    res.json(expenses.map(e => ({
      id: e.id,
      userId: e.userId,
      description: e.description,
      category: e.category,
      amount: e.amount,
      date: e.date,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { description, category, amount, date } = req.body;
    if (!description || !category || amount === undefined || !date) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    const [expense] = await db.insert(expensesTable).values({
      userId,
      description,
      category,
      amount: Number(amount),
      date,
    }).returning();
    res.status(201).json({
      id: expense.id,
      userId: expense.userId,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
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
    await db.delete(expensesTable).where(and(eq(expensesTable.id, id), eq(expensesTable.userId, userId)));
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
