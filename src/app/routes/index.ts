import express from "express";
import { UserRouter } from "../modules/auth/user.route.js";
import { CategoryRouter } from "../modules/category/category.routes.js";
import { FavoriteRouter } from "../modules/favorite/favorite.routes.js";
import { OperatorRouter } from "../modules/operator/operator.routes.js";
import { ServiceRouter } from "../modules/service/service.routes.js";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: UserRouter,
  },
  {
    path: "/operator",
    route: OperatorRouter,
  },
  {
    path: "/service",
    route: ServiceRouter,
  },
  {
    path: "/category",
    route: CategoryRouter,
  },
  {
    path: "/favorite",
    route: FavoriteRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
