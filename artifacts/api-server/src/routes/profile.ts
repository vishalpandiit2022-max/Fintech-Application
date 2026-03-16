import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, expensesTable } from "@workspace/db/schema";
import { eq, sum } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.put("/salary", requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { salary } = req.body;
    if (salary === undefined) {
      res.status(400).json({ error: "Salary is required" });
      return;
    }
    const [user] = await db.update(usersTable)
      .set({ salary: Number(salary) })
      .where(eq(usersTable.id, userId))
      .returning();
    res.json({ id: user.id, name: user.name, email: user.email, salary: user.salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
