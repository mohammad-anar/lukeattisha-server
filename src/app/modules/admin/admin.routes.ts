import express from "express";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";
import { AdminController } from "./admin.controller.js";

const router = express.Router();

router.get("/dashboard", auth(Role.ADMIN), AdminController.getDashboardStats);

router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);

router.patch("/users/:id/status", auth(Role.ADMIN), AdminController.updateUserStatus);

router.get("/settings", auth(Role.ADMIN), AdminController.getAdminSettings);

router.patch("/settings", auth(Role.ADMIN), AdminController.updateAdminSettings);

router.get("/tickets", auth(Role.ADMIN), AdminController.getAllTickets);

router.patch("/tickets/:id/status", auth(Role.ADMIN), AdminController.updateTicketStatus);

export const AdminRouter = router;
