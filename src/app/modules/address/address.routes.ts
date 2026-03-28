import express from "express";
import { Role } from "@prisma/client";
import { UserAddressController } from "./address.controller.js";
import { UserAddressValidation } from "./address.validation.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
const router = express.Router();

/* ================= USER OWN ADDRESSES ================= */    
router.post(
  "",
  auth(Role.USER, Role.ADMIN),
  validateRequest(UserAddressValidation.createSchema),
  UserAddressController.createAddress,
);

router.get(
  "",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.getMyAddresses,
);

router.get(
  "/:id",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.getSingleAddress,
);

router.patch(
  "/:id",
  auth(Role.USER, Role.ADMIN),
  validateRequest(UserAddressValidation.updateSchema),
  UserAddressController.updateAddress,
);

router.delete(
  "/:id",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.deleteAddress,
);

router.patch(
  "/:id/default",
  auth(Role.USER, Role.ADMIN),
  UserAddressController.setDefaultAddress,
);

export const UserAddressRouter = router;
