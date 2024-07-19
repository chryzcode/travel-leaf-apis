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
  deleteYatch,
} from "../controllers/yatch.js";

import { multerUpload } from "../utils/cloudinaryConfig.js";
import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/").get(allYatchs);
router.route("/user-yatchs").get(authenticateUser, currentUserYatchs);
router.route("/filter/:typeId").get(getYatchsByTypes);
router.route("/create").post(authenticateUser, multerUpload.array("media"), createYatch);
router.route("/edit/:yatchId").put(authenticateUser, multerUpload.array("media"), editYatch);
router.route("/:yatchId/detail").get(authenticateUser, getYatchDetail);
router.route("/yatch-types").get(allYatchTypes);
router.route("/available-yatchs").get(authenticateUser, getAvailableYatchs);
router.route("/booked-yatchs").get(authenticateUser, getBookedYatchs);
router.route("/delete/:yatchId").delete(authenticateUser, deleteYatch);

export default router;
