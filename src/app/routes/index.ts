import express from "express";
import { UserRouter } from "../modules/auth/user.route.js";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: UserRouter,
  },
  {
    path: "/workshop",
    route: UserRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
