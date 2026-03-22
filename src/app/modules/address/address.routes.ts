import express from "express";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { UserAddressController } from "./address.controller.js";
import { UserAddressValidation } from "./address.validation.js";

const router = express.Router();

/* ================= USER OWN ADDRESSES ================= */
router.post(
  "/addresses",
  auth(Role.USER, Role.ADMIN),
  validateRequest(UserAddressValidation.createSchema),
  UserAddressController.createAddress,
);

router.get(
  "/addresses",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.getMyAddresses,
);

router.get(
  "/addresses/:id",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.getSingleAddress,
);

router.patch(
  "/addresses/:id",
  auth(Role.USER, Role.ADMIN),
  validateRequest(UserAddressValidation.updateSchema),
  UserAddressController.updateAddress,
);

router.delete(
  "/addresses/:id",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.deleteAddress,
);

router.patch(
  "/addresses/:id/default",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.setDefaultAddress,
);

export const UserAddressRouter = router;
