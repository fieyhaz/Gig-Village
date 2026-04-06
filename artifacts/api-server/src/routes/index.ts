import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gigsRouter from "./gigs";
import providersRouter from "./providers";
import bookingsRouter from "./bookings";
import impactRouter from "./impact";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gigs", gigsRouter);
router.use("/providers", providersRouter);
router.use("/bookings", bookingsRouter);
router.use("/impact", impactRouter);

export default router;
