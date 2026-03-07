import express from "express";
import { UserRouter } from "../modules/auth/user.route.js";
import { BikeRouter } from "../modules/bike/bike.routes.js";
import { BookingRouter } from "../modules/booking/booking.routes.js";
import { CategoryRouter } from "../modules/category/category.routes.js";
import { JobRouter } from "../modules/job/job.routes.js";
import { JobOfferRouter } from "../modules/jobOffer/jobOffer.routes.js";
import { WorkshopRouter } from "../modules/workshop/workshop.routes.js";

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
  {
    path: "/category",
    route: CategoryRouter,
  },
  {
    path: "/offers",
    route: JobOfferRouter,
  },
  {
    path: "/booking",
    route: BookingRouter,
  },
  {
    path: "/bike",
    route: BikeRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
