import express from "express";
import { Role } from "@prisma/client";
import { AdminController } from "./admin.controller.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

router.get("/dashboard", auth(Role.ADMIN), AdminController.getDashboardStats);

router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);

router.patch("/users/:id/status", auth(Role.ADMIN), AdminController.updateUserStatus);

router.post("/settings", auth(Role.ADMIN), AdminController.createAdminSettings);

router.get("/settings", auth(Role.ADMIN), AdminController.getAdminSettings);

router.patch("/settings", auth(Role.ADMIN), AdminController.updateAdminSettings);

router.get("/tickets", auth(Role.ADMIN), AdminController.getAllTickets);

router.patch("/tickets/:id/status", auth(Role.ADMIN), AdminController.updateTicketStatus);

export const AdminRouter = router;
