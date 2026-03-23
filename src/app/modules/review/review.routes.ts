import express from "express";
import { Role } from "@prisma/client";
import { ReviewController } from "./review.controller.js";
import { ReviewValidation } from "./review.validation.js";
import auth from "app/middlewares/auth.js";
import validateRequest from "app/middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.USER),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview
);

router.get("/me", auth(Role.USER), ReviewController.getMyReviews);

router.get("/all", auth(Role.ADMIN), ReviewController.getAllReviews);

router.get("/service/:serviceId", ReviewController.getReviewsByService);

router.patch(
  "/:id/reply",
  auth(Role.OPERATOR),
  validateRequest(ReviewValidation.replySchema),
  ReviewController.replyToReview
);

router.delete("/:id", auth(Role.USER, Role.ADMIN), ReviewController.deleteReview);

export const ReviewRouter = router;
