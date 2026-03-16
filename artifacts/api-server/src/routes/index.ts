import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import expensesRouter from "./expenses";
import savingsRouter from "./savings";
import profileRouter from "./profile";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/expenses", expensesRouter);
router.use("/savings", savingsRouter);
router.use("/profile", profileRouter);
router.use("/dashboard", dashboardRouter);

export default router;
