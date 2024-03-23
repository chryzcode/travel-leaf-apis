import express from "express";
import {
  createYatch,
  editYatch,
  allYatchTypes,
  allYatchs,
  currentUserYatchs,
  getYatchsByTypes,
  getAvailableYatchs,
  getYatchDetail,
  getBookedYatchs,
} from "../controllers/yatch.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/").get(allYatchs);
router.route("/user-yatchs").get(authenticateUser, currentUserYatchs);
router.route("/filter/:typeId").get(getYatchsByTypes);
router.route("/create").post(authenticateUser, createYatch);
router.route("/edit/:yatchId").put(authenticateUser, editYatch);
router.route("/yatchId/detail").get(authenticateUser, getYatchDetail);
router.route("/yatch-types").get(allYatchTypes);
router.route("/available-yatchs").get(authenticateUser, getAvailableYatchs);
router.route("/booked-yatchs").get(authenticateUser, getBookedYatchs);

export default router;
