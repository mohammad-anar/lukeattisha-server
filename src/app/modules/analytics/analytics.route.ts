import express from "express";
import { Role } from "@prisma/client";
import auth from "src/app/middlewares/auth.js";
import { AnalyticsController } from "./analytics.controller.js";

const router = express.Router();

router.get("/user", auth(Role.USER), AnalyticsController.getUserAnalytics);
router.get("/workshop", auth(Role.WORKSHOP), AnalyticsController.getWorkshopAnalytics);
router.get("/admin", auth(Role.ADMIN), AnalyticsController.getAdminAnalytics);

export const AnalyticsRouter = router;
