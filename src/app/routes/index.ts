import express from "express";
import { UserRouter } from "../modules/auth/user.route.js";
import { WorkshopRouter } from "../modules/workshop/workshop.routes.js";
import { JobRouter } from "../modules/job/job.routes.js";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: UserRouter,
  },
  {
    path: "/workshop",
    route: WorkshopRouter,
  },
  {
    path: "/jobs",
    route: JobRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
